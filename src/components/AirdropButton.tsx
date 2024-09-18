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

interface AirdropButtonProps {
  data: Array<any[]>;
}

const AirdropButton: React.FC<AirdropButtonProps> = ({ data }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: hash, error, writeContract } = useWriteContract();

  const handleAirdrop = async () => {
    const wallets = data.map((row) => row[1]);
    const tokenIds = data.map((row) => row[2]);
    console.log("Airdropping to wallets:", wallets, tokenIds);

    setIsProcessing(true);

    const airdropContractAddress = `${
      import.meta.env.VITE_EXTERNAL_AIRDROP_CONTRACT_ADDRESS
    }` as Hex;

    writeContract({
      address: airdropContractAddress,
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
      toast.success("Transaction success!");
      setIsProcessing(false);
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
      onClick={handleAirdrop}
    >
      Airdrop
    </Button>
  );
};

export default AirdropButton;
