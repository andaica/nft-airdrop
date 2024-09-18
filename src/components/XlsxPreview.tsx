import { useState } from "react";
import * as XLSX from "xlsx";
import { Hex, isAddress } from "viem";
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
import ApproveButton from "./ApproveButton";
import AirdropButton from "./AirdropButton";

const XLSXReaderPreview = () => {
  const [sheets, setSheets] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState("");
  const [previewData, setPreviewData] = useState<any[][]>([]);
  const [fileName, setFileName] = useState("");
  const [appoveStatus, setApproveStatus] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState<Hex>();
  const [collectionAddressErr, setCollectionAddressErr] = useState(false);
  const [airdropContract, setAirdropContract] = useState<Hex>();
  const [airdropContractErr, setAirdropContractErr] = useState(false);

  const headerContent = ["#", "Wallet Address", "Token Id"];
  const maxRecord = 100;

  const handleCollectionChange = (data: string) => {
    if (isAddress(data)) {
      setCollectionAddressErr(false);
      setCollectionAddress(data);
    } else {
      setCollectionAddressErr(true);
    }
  };

  const handleAirdropContractChange = (data: string) => {
    if (isAddress(data)) {
      setAirdropContractErr(false);
      setAirdropContract(data);
    } else {
      setAirdropContractErr(true);
    }
  };

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
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
        header: 1,
        blankrows: false,
      });
      setPreviewData(jsonData.slice(1, maxRecord + 1)); // Preview (exclude header)
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName: string) => {
    setCurrentSheet(sheetName);
    const workbook = XLSX.read(fileName, { type: "binary" });
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, {
      header: 1,
      blankrows: false,
    });
    setPreviewData(jsonData.slice(1, maxRecord + 1)); // Preview (exclude header)
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center">
        <label
          htmlFor="airdropContract"
          className="text-sm font-medium text-gray-700 w-[240px]"
        >
          Airdrop Contract
        </label>
        <Input
          type="text"
          id="airdropContract"
          placeholder="Enter airdrop contract address"
          className={`${airdropContractErr ? "border-red-500" : ""}`}
          onChange={(e) => handleAirdropContractChange(e.target.value)}
        />
      </div>

      <div className="mb-8 flex items-center">
        <label
          htmlFor="collectionAddress"
          className="text-sm font-medium text-gray-700 w-[240px]"
        >
          Collection Address
        </label>
        <Input
          type="text"
          id="collectionAddress"
          placeholder="Enter collection address"
          className={`${collectionAddressErr ? "border-red-500" : ""}`}
          onChange={(e) => handleCollectionChange(e.target.value)}
        />
      </div>

      <h1 className="text-2xl font-bold mb-4">
        Airdrop XLSX Reader and Preview
      </h1>
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

          {collectionAddress && airdropContract ? (
            appoveStatus ? (
              <AirdropButton
                airdropContract={airdropContract}
                collectionAddress={collectionAddress}
                data={previewData}
              />
            ) : (
              <ApproveButton
                airdropContract={airdropContract}
                collectionAddress={collectionAddress}
                onApproveSuccess={setApproveStatus}
              />
            )
          ) : null}
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
            Showing all rows of data.
          </p>
        </div>
      )}
    </div>
  );
};

export default XLSXReaderPreview;
