export class ListingGoneError extends Error {
  constructor(public readonly slug: string) {
    super('Listing no longer available');
    this.name = 'ListingGoneError';
  }
}

export function isListingGoneError(error: unknown): error is ListingGoneError {
  return error instanceof ListingGoneError;
}
