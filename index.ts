import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { pool } from './db';
import { authRoutes } from './routes/authRoutes';
import { studentRoutes } from './routes/studentRoutes';
import { feeRoutes } from './routes/feeRoutes';
import { auditRoutes } from './routes/auditRoutes';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: '*' });

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret_fallback_key_2026',
});

// Register All API Routes
fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(studentRoutes, { prefix: '/api/students' });
fastify.register(feeRoutes, { prefix: '/api/fees' });
fastify.register(auditRoutes, { prefix: '/api/audit' });

// Health Check Endpoint
fastify.get('/health', async (request, reply) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    return {
      status: 'ok',
      message: 'Kinetex AMS Backend is running smoothly!',
      dbTime: dbResult.rows[0].now,
    };
  } catch (error) {
    reply.status(500).send({ status: 'error', message: 'Database connection failed' });
  }
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 5000;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();