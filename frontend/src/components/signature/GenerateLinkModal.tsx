import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signingLinkService } from "@/services/signingLink.service";

const schema = z.object({
  signerEmail: z
    .string({ required_error: "Signer email is required" })
    .email("Please enter a valid email address"),
});

type FormData = z.infer<typeof schema>;

interface GenerateLinkModalProps {
  documentId: string;
  documentTitle: string;
  onClose: () => void;
  onGenerated: (url: string) => void;
}

export function GenerateLinkModal({
  documentId,
  documentTitle,
  onClose,
  onGenerated,
}: GenerateLinkModalProps) {
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const { url } = await signingLinkService.generate({
        documentId,
        signerEmail: data.signerEmail,
      });
      setGeneratedUrl(url);
      onGenerated(url);
      toast.success("Signing link generated!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to generate link";
      toast.error(msg);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Send for signing
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">
              {documentTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!generatedUrl ? (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Signer's email address"
                type="email"
                placeholder="signer@example.com"
                autoFocus
                required
                error={errors.signerEmail?.message}
                hint="They'll receive a link to sign without needing an account"
                {...register("signerEmail")}
              />

              {/* Expiry note */}
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Link expires in 7 days and can only be used once
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  Generate link
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Success state */}
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-800">
                  Signing link created!
                </p>
              </div>

              {/* URL box */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono truncate">
                  {generatedUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    copied
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Share this link with the signer. It expires in 7 days.
              </p>

              <Button variant="secondary" onClick={onClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
