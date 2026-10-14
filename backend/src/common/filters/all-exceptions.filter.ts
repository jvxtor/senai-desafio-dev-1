import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.resolve(exception);
    response.status(status).json({ message });
  }

  private resolve(exception: unknown): { status: number; message: string } {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractMessage(exception.getResponse()),
      };
    }

    const status = (exception as { status?: unknown })?.status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return { status, message: 'Corpo da requisição inválido.' };
    }

    this.logger.error(exception);
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor.',
    };
  }

  private extractMessage(body: string | object): string {
    if (typeof body === 'string') return body;
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message)) return message.join('; ');
    if (typeof message === 'string' && message.length > 0) return message;
    return 'Requisição inválida.';
  }
}
