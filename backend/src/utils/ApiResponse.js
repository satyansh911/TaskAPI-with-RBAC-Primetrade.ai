/**
 * Standardized API success response
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable message
   * @param {*} data - Response payload
   * @param {object} meta - Pagination or extra metadata
   */
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      ...(this.data !== undefined && { data: this.data }),
      ...(this.meta !== undefined && { meta: this.meta }),
    });
  }
}

module.exports = ApiResponse;
