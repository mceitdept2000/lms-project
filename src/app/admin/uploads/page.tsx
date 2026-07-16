import { FileUploadForm } from "~/app/_components/file-upload-form";
import { NoteManager } from "~/app/_components/note-manager";
import { QuestionPaperManager } from "~/app/_components/question-paper-manager";

export default function UploadsPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-primary text-xl font-bold">Uploads</h1>
        <FileUploadForm />
      </div>
      <NoteManager />
      <QuestionPaperManager />
    </div>
  );
}
