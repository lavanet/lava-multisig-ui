import { useChains } from "@/context/ChainsContext";
import { getRecentChainsFromStorage } from "@/context/ChainsContext/storage";
import { ChainInfo } from "@/context/ChainsContext/types";
import { useLayoutEffect, useState } from "react";
import { Command, CommandEmpty, CommandInput, CommandList, CommandSeparator } from "../ui/command";
import ChainsGroup from "./ChainsGroup";

export default function ChooseChain() {
  const { chains } = useChains();
  const [recentChains, setRecentChains] = useState<readonly ChainInfo[]>([]);

  useLayoutEffect(() => {
    const newRecentChains = getRecentChainsFromStorage(chains);
    setRecentChains(newRecentChains);
  }, [chains]);

  return (
    <Command
      className="bg-orange-600 text-white"
      style={
        {
          "--accent": "0, 100%, 100%",
          "--border": "0, 100%, 100%",
        } as React.CSSProperties
      }
    >
      <CommandInput placeholder="Type a chain name or id…" />
      <div className="overflow-x-auto overflow-y-auto">
        <CommandList className="max-h-full overflow-x-hidden overflow-y-visible">
          <CommandEmpty>No results found.</CommandEmpty>
          <ChainsGroup
            chains={recentChains}
            heading="Recently used chains:"
            emptyMsg="No recent chains found."
          />
          <CommandSeparator className="m-2" />
          <ChainsGroup
            chains={Array.from(chains.localnets.values())}
            heading="Custom chains:"
            emptyMsg={`No custom chains found. You can add one on the "Custom chain" tab.`}
          />
          <CommandSeparator className="m-2" />
          <ChainsGroup
            chains={Array.from(chains.mainnets.values())}
            heading="Mainnets:"
            emptyMsg="No mainnets chains found."
          />
          <CommandSeparator className="m-2" />
          <ChainsGroup
            chains={Array.from(chains.testnets.values())}
            heading="Testnets:"
            emptyMsg="No testnets chains found."
          />
        </CommandList>
      </div>
    </Command>
  );
}
