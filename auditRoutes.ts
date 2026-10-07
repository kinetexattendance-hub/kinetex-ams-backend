import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', authenticate);

  // Get Audit Logs
  fastify.get('/', async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'
      );
      return reply.send({ status: 'success', data: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to fetch audit logs' });
    }
  });
}