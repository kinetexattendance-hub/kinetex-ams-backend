import { FastifyInstance } from 'fastify';
import { pool } from '../db';
import { authenticate } from '../middleware/auth';

export async function studentRoutes(fastify: FastifyInstance) {
  // Apply Auth Middleware to all student routes
  fastify.addHook('onRequest', authenticate);

  // 1. Get All Students List
  fastify.get('/', async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT id, name, email, phone, status, created_at FROM students ORDER BY created_at DESC'
      );
      return reply.send({ status: 'success', data: result.rows });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to fetch students' });
    }
  });

  // 2. Add New Student
  fastify.post('/', async (request, reply) => {
    const { name, email, phone } = request.body as {
      name: string;
      email: string;
      phone?: string;
    };

    if (!name || !email) {
      return reply.status(400).send({ message: 'Name and email are required' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO students (name, email, phone, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone || null, 'active']
      );
      return reply.status(201).send({ status: 'success', data: result.rows[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to create student' });
    }
  });

  // 3. Get Student by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return reply.status(404).send({ message: 'Student not found' });
      }
      return reply.send({ status: 'success', data: result.rows[0] });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to fetch student profile' });
    }
  });
}