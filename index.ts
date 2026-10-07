import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { pool } from '../src/db';
import { authRoutes } from '../src/routes/authRoutes';
import { studentRoutes } from '../src/routes/studentRoutes';
import { feeRoutes } from '../src/routes/feeRoutes';
import { auditRoutes } from '../src/routes/auditRoutes';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: '*' });

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecret_fallback_key_2026',
});

// Register Routes
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
      message: 'Kinetex AMS Backend is running smoothly on Vercel!',
      dbTime: dbResult.rows[0].now,
    };
  } catch (error) {
    reply.status(500).send({ status: 'error', message: 'Database connection failed' });
  }
});

// Vercel Serverless Handler
export default async function handler(req: any, res: any) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}