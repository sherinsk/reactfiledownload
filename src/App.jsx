import React, { useState } from "react";

const App = () => {
  const [password, setPassword] = useState("");
  const [fileBlob, setFileBlob] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [filename, setFilename] = useState("file");
  const [error, setError] = useState(null);

  const fetchFile = async () => {
    try {
      const response = await fetch("https://filestreambackend.onrender.com/get-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch the file");
        return;
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      console.log(response)
      let fetchedFilename = "file";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const matches = contentDisposition.match(/filename="?(.+?)"?/);
        if (matches && matches[1]) {
          fetchedFilename = matches[1];
        }
      }

      const blob = await response.blob();
      setFileBlob(blob);
      setFileType(blob.type);
      setFilename(fetchedFilename);
      setError(null);
    } catch (err) {
      setError("Failed to fetch file");
      console.error(err);
    }
  };

  const renderFile = () => {
    if (!fileBlob) return null;

    const fileUrl = URL.createObjectURL(new Blob([fileBlob], { type: fileType }));

    return (
      <div>
        {/* Render image if the file is an image */}
        {fileType?.startsWith("image/") && (
          <div>
            <img
              src={fileUrl}
              alt="File"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
            />
            <a href={fileUrl} download={filename} style={{ display: "block", marginTop: "10px" }}>
              Download Image
            </a>
          </div>
        )}

        {/* Render PDF if the file is a PDF */}
        {fileType === "application/pdf" && (
          <div>
            <iframe
              src={fileUrl}
              width="100%"
              height="500px"
              title="PDF File"
            ></iframe>
            <a href={fileUrl} download={filename} style={{ display: "block", marginTop: "10px" }}>
              Download PDF
            </a>
          </div>
        )}

        {/* Render Word document (.docx) */}
        {fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && (
          <div>
            <a href={fileUrl} download={filename} style={{ display: "block", marginTop: "10px" }}>
              Download Word Document
            </a>
          </div>
        )}

        {/* Render Excel file (.xlsx) */}
        {fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && (
          <div>
            <a href={fileUrl} download={filename} style={{ display: "block", marginTop: "10px" }}>
              Download Excel File
            </a>
          </div>
        )}

        {/* Render other file types */}
        {fileType && !fileType.startsWith("image/") && fileType !== "application/pdf" && fileType !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && (
          <div>
            <a href={fileUrl} download={filename} style={{ display: "block", marginTop: "10px" }}>
              Download File
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Secure File Viewer</h1>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />
      <button onClick={fetchFile} style={{ padding: "5px 10px" }}>
        Fetch File
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginTop: "20px" }}>{renderFile()}</div>
    </div>
  );
};

export default App;
