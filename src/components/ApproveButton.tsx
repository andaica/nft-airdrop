import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import NFT2Abi from "../abi/nft2.json";
import { Hex } from "viem";
import { toast } from "react-toastify";

interface ApproveButtonProps {
  onApproveSuccess: (status: boolean) => void;
}

const ApproveButton: React.FC<ApproveButtonProps> = ({ onApproveSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: hash, error, writeContract } = useWriteContract();

  const handleApproval = async () => {
    setIsProcessing(true);

    const collectionAddress = `${
      import.meta.env.VITE_EXTERNAL_COLLECTION_ADDRESS
    }` as Hex;
    const airdropContractAddress = `${
      import.meta.env.VITE_EXTERNAL_AIRDROP_CONTRACT_ADDRESS
    }` as Hex;

    writeContract({
      address: collectionAddress,
      abi: NFT2Abi,
      functionName: "setApprovalForAll",
      args: [airdropContractAddress, true],
    });
  };

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Approval success!");
      setIsProcessing(false);
      onApproveSuccess(true);
    }
    if (error) {
      toast.error((error as BaseError).shortMessage || error.message);
      setIsProcessing(false);
    }
  }, [isConfirmed, error]);

  return (
    <Button
      className={`${
        isProcessing ? "bg-gray-500" : "bg-green-500"
      } text-white w-[240px] h-[50px]`}
      disabled={isProcessing}
      onClick={handleApproval}
    >
      Approve
    </Button>
  );
};

export default ApproveButton;
