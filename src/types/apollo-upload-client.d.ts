declare module "apollo-upload-client" {
  import type { ApolloLink } from "@apollo/client";

  interface CreateUploadLinkOptions {
    uri?: string;
    headers?: Record<string, string>;
    credentials?: string;
    fetchOptions?: Record<string, unknown>;
    fetch?: typeof fetch;
    includeExtensions?: boolean;
    isExtractableFile?: (value: unknown) => boolean;
    formDataAppendFile?: (
      formData: FormData,
      fieldName: string,
      file: unknown
    ) => void;
  }

  export function createUploadLink(options?: CreateUploadLinkOptions): ApolloLink;
}
