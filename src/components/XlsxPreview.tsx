import { useState } from "react";
import * as XLSX from "xlsx";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const XLSXReaderPreview = () => {
  const [sheets, setSheets] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>("");
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [fileName, setFileName] = useState<string>("");

  const headerContent = ["#", "Wallet Address", "Token Id"];

  const handleFileUpload = (event: any) => {
    const file: File = event.target.files[0];
    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target) return;
      const workbook = XLSX.read(e.target.result, { type: "array" });

      const sheetNames = workbook.SheetNames;
      setSheets(sheetNames);
      setCurrentSheet(sheetNames[0]);

      const worksheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, blankrows: false });
      setPreviewData(jsonData.slice(1)); // Preview (exclude header)
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName: string) => {
    setCurrentSheet(sheetName);
    const workbook = XLSX.read(fileName, { type: "binary" });
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1, blankrows: false });
    setPreviewData(jsonData.slice(1)); // Preview (exclude header)
  };

  const handleAirdrop = () => {
    const wallets = previewData.map((row) => row[1]);
    const tokenIds = previewData.map((row) => row[2]);
    console.log("Airdropping to wallets:", wallets, tokenIds);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">XLSX Reader and Preview</h1>
      <div className="mb-4">
        <Input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="hidden"
          id="xlsxFileInput"
        />
        <Button
          onClick={() => document.getElementById("xlsxFileInput")!.click()}
          className="mr-2"
        >
          Choose XLSX File
        </Button>
        <span>{fileName || "No file chosen"}</span>
      </div>
      {sheets.length > 0 && (
        <div className="mb-4 flex justify-between items-center">
          <Select value={currentSheet} onValueChange={handleSheetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a sheet" />
            </SelectTrigger>
            <SelectContent>
              {sheets.map((sheet) => (
                <SelectItem key={sheet} value={sheet}>
                  {sheet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-green-500 text-white w-[180px] h-[50px]"
            onClick={handleAirdrop}
          >
            Airdrop
          </Button>
        </div>
      )}
      {previewData.length > 0 && (
        <div>
          <Table>
            <thead>
              <tr>
                {headerContent.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          <p className="mt-2 text-sm text-gray-500">
            Showing all rows of data (excluding header).
          </p>
        </div>
      )}
    </div>
  );
};

export default XLSXReaderPreview;
