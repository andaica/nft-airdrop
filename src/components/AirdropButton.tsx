import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type BaseError,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import NFTAirDropAbi from "../abi/nftairdrop.json";
import { Hex } from "viem";
import { toast } from "react-toastify";

interface AirdropButtonProps {
  airdropContract: Hex;
  collectionAddress: Hex;
  data: Array<any[]>;
}

const AirdropButton: React.FC<AirdropButtonProps> = ({
  airdropContract,
  collectionAddress,
  data,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: hash, error, writeContract } = useWriteContract();

  const handleAirdrop = async () => {
    const wallets: Hex[] = data.map((row) => row[1]);
    const tokenIds = data.map((row) => row[2]);
    console.log("Airdropping to wallets:", wallets, tokenIds);

    setIsProcessing(true);

    writeContract({
      address: airdropContract,
      abi: NFTAirDropAbi,
      functionName: "airdrop",
      args: [collectionAddress, wallets, tokenIds],
    });
  };

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Airdrop success!");
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
