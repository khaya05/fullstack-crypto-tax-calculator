import { FaFile, FaUpload, FaFileCsv, FaFileExcel, FaFileAlt, FaCheckCircle, FaTimes } from "react-icons/fa";
import { InfoBox } from "../MessageBoxes/MessageBoxes.jsx";
import { 
  FileFormats, FileFormat, UploadZone, UploadIcon, 
  FileList, FileItem, FileStatus, RemoveButton 
} from "../ImportModal.styles";

const fileFormats = [
  { name: "CSV", icon: <FaFileCsv /> },
  { name: "Excel", icon: <FaFileExcel /> },
  { name: "Text", icon: <FaFileAlt /> },
];

export default function FileUploadTab({ files, setFiles, setShowPreview }) {
  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setShowPreview(false);
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    setShowPreview(false);
  };

  return (
    <>
      <InfoBox>
        <FaCheckCircle />
        <div>
          <strong>Required Format:</strong> Date, Transaction Type, Asset, Quantity, Price per Unit (ZAR), Total Value (ZAR), Fees (ZAR), Exchange/Wallet, Transaction ID, Notes
          <br />
          <small>Transaction Types: Buy, Sell, Trade, Transfer | Tab or comma separated</small>
        </div>
      </InfoBox>

      <label>Supported Formats:</label>
      <FileFormats>
        {fileFormats.map((format) => (
          <FileFormat key={format.name}>
            {format.icon}
            {format.name}
          </FileFormat>
        ))}
      </FileFormats>

      <input
        type="file"
        hidden
        multiple
        accept=".csv,.xlsx,.xls,.txt,.tsv"
        id="file-input"
        onChange={handleFileChange}
      />
      <UploadZone onClick={() => document.getElementById("file-input").click()}>
        <UploadIcon>
          <FaUpload />
        </UploadIcon>
        <strong>Drag & drop your transaction files</strong>
        <span>or click to browse (CSV, Excel, TSV, Text)</span>
      </UploadZone>

      {files.length > 0 && (
        <FileList>
          {files.map((f, i) => (
            <FileItem key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <FaFile />
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{f.name}</p>
                  <small style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
                    {(f.size / 1024).toFixed(2)} KB
                  </small>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileStatus ready>
                  <FaCheckCircle style={{ marginRight: "0.25rem" }} />
                  Ready
                </FileStatus>
                <RemoveButton onClick={() => handleRemoveFile(i)}>
                  <FaTimes />
                </RemoveButton>
              </div>
            </FileItem>
          ))}
        </FileList>
      )}
    </>
  );
}