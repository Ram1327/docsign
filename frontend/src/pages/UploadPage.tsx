import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { documentService } from "@/services/document.service";
import { formatFileSize } from "@/utils/format";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const uploadSchema = z.object({
  title: z.string().max(200).optional(),
});

type UploadForm = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
  });

  const validateAndSetFile = (f: File): boolean => {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return false;
    }
    if (f.size > MAX_SIZE_BYTES) {
      toast.error(`File too large. Maximum size is ${MAX_SIZE_MB}MB`);
      return false;
    }
    setFile(f);
    return true;
  };

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const onSubmit = async (data: UploadForm) => {
    if (!file) { toast.error("Please select a file"); return; }

    setUploading(true);
    setProgress(0);

    try {
      const doc = await documentService.upload(
        { file, title: data.title || undefined },
        setProgress
      );
      toast.success("Document uploaded successfully!");
      navigate(`/documents/${doc._id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Upload failed. Please try again.";
      toast.error(msg);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </button>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Upload document</h1>
        <p className="text-sm text-gray-500 mt-0.5">Upload a PDF to send for signing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={clsx(
            "relative border-2 border-dashed rounded-2xl transition-all duration-200",
            !file && "cursor-pointer",
            isDragging
              ? "border-brand-400 bg-brand-50 scale-[1.01]"
              : file
              ? "border-green-300 bg-green-50"
              : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/40"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onFileChange}
          />

          {file ? (
            /* File selected state */
            <div className="p-8 flex items-center gap-4">
              <div className="w-12 h-14 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
                {uploading && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Uploading…</span>
                      <span className="text-xs text-brand-600 font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            /* Empty drop zone */
            <div className="p-12 flex flex-col items-center gap-3">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                isDragging ? "bg-brand-100" : "bg-gray-100"
              )}>
                <svg className={clsx("w-6 h-6 transition-colors", isDragging ? "text-brand-600" : "text-gray-400")}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">
                  {isDragging ? "Drop it here" : "Drag & drop your PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  or <span className="text-brand-600 font-medium">browse files</span> · PDF only · max {MAX_SIZE_MB}MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Optional title */}
        <Input
          label="Document title"
          placeholder="e.g. NDA Agreement Q4 2025"
          hint="Optional — defaults to the filename if left empty"
          error={errors.title?.message}
          {...register("title")}
        />

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            isLoading={uploading}
            disabled={!file || uploading}
            className="flex-1"
          >
            {uploading ? `Uploading ${progress}%…` : "Upload document"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/dashboard")}
            disabled={uploading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
