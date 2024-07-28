export interface HttpRequestErrorOptions extends ErrorOptions {
  response?: Response;
  url?: string;
  requestUrl?: string;
  statusCode?: number;
  statusText?: string;
  responseBody?: string;
}

/**
 * The error that is thrown to indicate a failed HTTP request, usually indicated by status code.
 */
export class HttpRequestError extends Error {
  public override name = "HttpRequestError";
  public readonly response?: Response;
  public readonly url?: string;
  public readonly requestUrl?: string;
  public readonly statusCode?: number;
  public readonly statusText?: string;
  public readonly responseBody?: string;
  public constructor(message?: string, options?: HttpRequestErrorOptions) {
    super(message ?? formatHttpRequestErrorMessage(options), options);
    this.response = options?.response;
    this.url = options?.url;
    this.requestUrl = options?.requestUrl;
    this.statusCode = options?.statusCode;
    this.statusText = options?.statusText;
    this.responseBody = options?.responseBody;
  }
  public static async fromResponse(response: Response, options?: HttpRequestErrorOptions): Promise<HttpRequestError> {
    const localOptions = { ...options };
    localOptions.response ??= response;
    localOptions.url ??= response.url;
    localOptions.requestUrl ??= response.redirected ? undefined : response.url;
    localOptions.statusCode ??= response.status;
    localOptions.statusText ??= response.statusText;
    if (localOptions.responseBody == null && !response.bodyUsed) {
      try {
        localOptions.responseBody = await response.text();
      } catch (err) {
        localOptions.responseBody = `<Failed to retrieve response body: ${err}>`;
      }
    }
    return new HttpRequestError(undefined, localOptions);
  }
}

function formatHttpRequestErrorMessage(options?: HttpRequestErrorOptions): string {
  const statusCode = options?.statusCode ?? options?.response?.status;
  const statusText = options?.statusText ?? options?.response?.statusText;
  const responseBody = options?.responseBody;
  let message = "HTTP request has failed";
  if (statusCode != null || statusText) {
    message += `with status code ${statusCode ?? "-"}`;
    if (statusText) message += ` (${statusText})`;
  }
  if (responseBody)
    message += ": " + responseBody;
  else
    message += ".";
  return message;
}

/**
 * Ensures the given HTTP response has a successful status code.
 * @throws {@link HttpRequestError} `response.ok` is `false`, i.e., `response.status` is outside the range of 200 ~ 299.
 * @see {@link Response.ok}
 */
export async function ensureResponseOK(response: Response): Promise<void> {
  if (response.ok) return;
  const err = await HttpRequestError.fromResponse(response);
  throw err;
}
