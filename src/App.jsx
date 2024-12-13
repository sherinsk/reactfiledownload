import React, { useState } from "react";

const App = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const fetchFile = async () => { 
  
    try {
      const response = await fetch("https://filestreambackend.onrender.com/get-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }), // Send any necessary data in the body
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch the file");
        return;
      }
  
      // Extract filename from Content-Disposition header (if present)
      const contentDisposition = response.headers.get("Content-Disposition");
      let fetchedFilename = "downloadedFile";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          fetchedFilename = matches[1].replace(/['"]/g, '');  // Remove any surrounding quotes
        }
      }
  
      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
  
      // Create an anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = fetchedFilename;  // Set the filename for the download
      a.click();  // Trigger the download
  
      // Clean up the URL object after download
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      
      setError(null);  // Reset error state if everything goes well
  
    } catch (err) {
      setError("Failed to fetch file");
      console.error(err);
    }
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
      <button onClick={fetchFile} style={{ padding: "5px 10px", marginTop: "10px" }}>
        Fetch and Download File
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;
