/**
 * Erreur personnalisée pour l'application
 */
class AppError extends Error {
  public statusCode: number;
  public statusText: string;
  public details: Record<string, unknown>;
  public isOperational: boolean;
  constructor({
    statusCode = 500,
    statusText = "Erreur Interne du Serveur",
    message = "Erreur Inconnue",
    details = {},
    isOperational = true,
  }) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
