import { LoadingStates, WalletInfo, WalletType } from "@/types/signing";
import { makeCosmoshubPath } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { LedgerSigner } from "@cosmjs/ledger-amino";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useLayoutEffect, useState } from "react";
import { useChains } from "../../../context/ChainsContext";
import { getConnectError } from "../../../lib/errorHelpers";
import { Button } from "../../ui/button";

interface ButtonConnectWalletProps {
  readonly walletType: WalletType;
  readonly walletInfoState: [
    WalletInfo | null | undefined,
    Dispatch<SetStateAction<WalletInfo | null | undefined>>,
  ];
  readonly setError: Dispatch<SetStateAction<string>>;
}

export default function ButtonConnectWallet({
  walletType,
  walletInfoState: [walletInfo, setWalletInfo],
  setError,
}: ButtonConnectWalletProps) {
  const { chain } = useChains();
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setError("");
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      await window.keplr.enable(chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };

      const { bech32Address: address, pubKey: pubKeyArray } = await window.keplr.getKey(
        chain.chainId,
      );
      const pubKey = toBase64(pubKeyArray);

      setWalletInfo({ type: "Keplr", address, pubKey });
    } catch (e) {
      console.error(e);
      setError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [chain.chainId, setError, setWalletInfo]);
  
  const addLavaToKeplr = useCallback(async () => {
    try {
      setError("");
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      
      await window.keplr.experimentalSuggestChain(
        {
          "chainId": "lava-testnet-2",
          "chainName": "Lava",
          "rpc": "https://public-rpc.lavanet.xyz:443",
          "rest": "https://rest-public-rpc.lavanet.xyz:443",
          "bip44": {
            "coinType": 118
          },
          "bech32Config": {
            "bech32PrefixAccAddr": "lava@",
            "bech32PrefixAccPub": "lava@pub",
            "bech32PrefixValAddr": "lava@valoper",
            "bech32PrefixValPub": "lava@valoperpub",
            "bech32PrefixConsAddr": "lava@valcons",
            "bech32PrefixConsPub": "lava@valconspub"
          },
          "currencies": [
            {
              "coinDenom": "LAVA",
              "coinMinimalDenom": "ulava",
              "coinDecimals": 6,
              "coinGeckoId": "unknown"
            }
          ],
          "feeCurrencies": [
            {
              "coinDenom": "LAVA",
              "coinMinimalDenom": "ulava",
              "coinDecimals": 6,
              "coinGeckoId": "unknown",
              "gasPriceStep": {
                "low": 0,
                "average": 0.025,
                "high": 0.03
              }
            }
          ],
          "stakeCurrency": {
            "coinDenom": "LAVA",
            "coinMinimalDenom": "ulava",
            "coinDecimals": 6,
            "coinGeckoId": "unknown"
          },
          "features": [],
          "beta": true
        }

      )
      // await window.keplr.enable(chain.chainId);
      // window.keplr.defaultOptions = {
      //   sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      // };

      // const { bech32Address: address, pubKey: pubKeyArray } = await window.keplr.getKey(
      //   chain.chainId,
      // );
      // const pubKey = toBase64(pubKeyArray);

      // setWalletInfo({ type: "Keplr", address, pubKey });
    } catch (e) {
      console.error(e);
      setError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [chain.chainId, setError, setWalletInfo]);

  useLayoutEffect(() => {
    if (!walletInfo?.address) {
      return;
    }

    const accountChangeKey = "keplr_keystorechange";

    if (walletInfo.type === "Keplr") {
      window.addEventListener(accountChangeKey, connectKeplr);
    } else if (walletInfo.type === "Add Lava To Keplr") {
      window.addEventListener(accountChangeKey, addLavaToKeplr);
    } else {
      window.removeEventListener(accountChangeKey, connectKeplr);
    }
  }, [connectKeplr, walletInfo, addLavaToKeplr]);

  const connectLedger = async () => {
    try {
      setError("");
      setLoading((newLoading) => ({ ...newLoading, ledger: true }));

      const ledgerTransport = await TransportWebUSB.create(120000, 120000);
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: chain.addressPrefix,
      });

      const [{ address, pubkey: pubKeyArray }] = await offlineSigner.getAccounts();
      const pubKey = toBase64(pubKeyArray);

      setWalletInfo({ type: "Ledger", address, pubKey });
    } catch (e) {
      console.error(e);
      setError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, ledger: false }));
    }
  };

  const onClick = (() => {
    if (walletType === "Keplr") {
      return connectKeplr;
    }

    if (walletType === "Add Lava To Keplr") {
      return addLavaToKeplr;
    }

    if (walletType === "Ledger") {
      return connectLedger;
    }

    return () => {};
  })();

  const isLoading =
    (walletType === "Keplr" && loading.keplr) || (walletType === "Ledger" && loading.ledger);

  return (
    <Button onClick={onClick} disabled={loading.keplr || loading.ledger}>
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <>
          <Image
            alt=""
            src={`/assets/icons/${walletType.toLowerCase()}.svg`}
            width={20}
            height={20}
            className="mr-2"
          />
          {walletType === "Add Lava To Keplr" ? (
            walletType
          ) : (
            <>
              Connect {walletType}
            </>
          )}
        </>
      )}
    </Button>
  );
}
