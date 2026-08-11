import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { fail, success } from '../lib/http';
import { signToken } from '../lib/jwt';
import { AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return fail(res, 400, 'Validation failed', parsed.error.flatten());
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return fail(res, 401, 'Invalid credentials');
  }

  const passwordOk = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    return fail(res, 401, 'Invalid credentials');
  }

  const token = signToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name
  });

  return success(res, {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = req.user;
  return success(res, { user });
});

export default router;