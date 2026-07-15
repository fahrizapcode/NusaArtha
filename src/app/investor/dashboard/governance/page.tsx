"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import {
  Vote,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useStellarWallet } from "@/lib/stellar/context";
import { castVoteOnStellar, fetchProposalFromIPFS, hasVotedOnChain } from "@/lib/stellar/governance";
import { getGovernanceProposals } from "@/lib/stellar/soroban";
import { getTokenBalance, poolIdToAssetCode } from "@/lib/stellar/assets";
import { getStellarExpertUrl } from "@/lib/stellar/network";

type Proposal = {
  id: string;
  poolId: string;
  title: string;
  description: string;
  options: { id: number; label: string; votes: number }[];
  deadline: string;
  status: "active" | "ended";
  totalVoters: number;
  participation: number;
  myVote: number | null;
  myVoteTxHash?: string;
  tokenBalance?: number;
  descriptionCID?: string;
};

// Proposals di-fetch dari API + governance contract
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: "PROP-001",
    poolId: "pool-bsd-city",
    title: "Persetujuan Penggunaan Dana Cadangan (Capex)",
    description:
      "Outlet BSD City membutuhkan penggantian mesin espresso utama karena kerusakan yang tidak tercover garansi senilai Rp 15 juta. Dana akan diambil dari pencadangan sinking fund yang saat ini berjumlah Rp 25 juta.",
    options: [
      { id: 0, label: "Setuju — Gunakan dana cadangan", votes: 180 },
      { id: 1, label: "Tidak Setuju — Cari solusi lain", votes: 45 },
      { id: 2, label: "Tunda — Minta laporan lebih lanjut", votes: 25 },
    ],
    deadline: "20 Juli 2026",
    status: "active",
    totalVoters: 250,
    participation: 75,
    myVote: null,
  },
  {
    id: "PROP-002",
    poolId: "pool-cihampelas",
    title: "Perpanjangan Kontrak Sewa Ruko",
    description:
      "Sewa ruko Outlet Cihampelas akan habis 3 bulan lagi. Pemilik ruko menaikkan harga sewa 5% menjadi Rp 42 juta/tahun. Platform menyarankan perpanjangan karena lokasi strategis.",
    options: [
      { id: 0, label: "Setuju — Perpanjang dengan harga baru", votes: 420 },
      { id: 1, label: "Tidak Setuju — Relokasi ke tempat lain", votes: 80 },
    ],
    deadline: "10 Juni 2026",
    status: "ended",
    totalVoters: 500,
    participation: 100,
    myVote: 0,
    myVoteTxHash: "a1b2c3d4e5f6",
  },
];

const formatProposalDeadline = (votingEndTime: number | string | null): string => {
  if (!votingEndTime) return "-";
  let timestamp = Number(votingEndTime);
  if (Number.isNaN(timestamp)) return String(votingEndTime);
  if (timestamp < 1_000_000_000_000) {
    timestamp = timestamp * 1000;
  }
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const normalizeProposalStatus = (
  executed: boolean | null,
  votingEndTime: number | string | null,
): "active" | "ended" => {
  if (executed) return "ended";
  if (!votingEndTime) return "active";
  let timestamp = Number(votingEndTime);
  if (Number.isNaN(timestamp)) return "active";
  if (timestamp < 1_000_000_000_000) {
    timestamp = timestamp * 1000;
  }
  return timestamp < Date.now() ? "ended" : "active";
};

const parseProposalOption = (raw: any, index: number) => {
  if (raw == null) {
    return { id: index, label: `Pilihan ${index + 1}`, votes: 0 };
  }
  const id = Number(raw.id ?? raw[0] ?? index);
  const label =
    typeof raw === "string"
      ? raw
      : String(raw.description ?? raw.label ?? raw.text ?? raw[1] ?? `Pilihan ${index + 1}`);
  const votes = Number(raw.voteCount ?? raw.votes ?? raw[2] ?? 0);
  return { id: Number.isNaN(id) ? index : id, label, votes: Number.isNaN(votes) ? 0 : votes };
};

const parseProposalItem = async (raw: any, poolIdOverride?: string): Promise<Proposal | null> => {
  if (!raw) return null;

  const id = String(raw.id ?? raw[0] ?? "");
  if (!id) return null;

  const poolId = String(raw.poolId ?? raw[1] ?? poolIdOverride ?? "");
  const title = String(raw.title ?? raw[2] ?? "Proposal governance");
  const descriptionCID = String(raw.descriptionCID ?? raw[3] ?? "");
  const votingEndTime = raw.votingEndTime ?? raw[4] ?? null;
  const executed = Boolean(raw.executed ?? raw[5] ?? false);
  const winningOptionId = raw.winningOptionId ?? raw[6] ?? null;

  let options: Proposal["options"] = [];
  const rawOptions = raw.options ?? raw.proposalOptions ?? raw[7] ?? [];
  if (Array.isArray(rawOptions)) {
    options = rawOptions.map(parseProposalOption);
  }

  if (options.length === 0) {
    options = [
      { id: 0, label: "Setuju", votes: 0 },
      { id: 1, label: "Tidak Setuju", votes: 0 },
    ];
  }

  const proposal: Proposal = {
    id,
    poolId,
    title,
    description: "",
    options,
    deadline: formatProposalDeadline(votingEndTime),
    status: normalizeProposalStatus(executed, votingEndTime),
    totalVoters: options.reduce((sum, option) => sum + option.votes, 0),
    participation: 0,
    myVote: null,
    descriptionCID: descriptionCID || undefined,
    winningOptionId: typeof winningOptionId === "number" ? winningOptionId : null,
  } as Proposal;

  if (descriptionCID) {
    const metadata = await fetchProposalFromIPFS(descriptionCID);
    if (metadata) {
      proposal.title = String(metadata.title ?? proposal.title);
      proposal.description = String(metadata.description ?? proposal.description ?? "");
      const optionData = metadata.options ?? metadata.optionDescriptions;
      if (Array.isArray(optionData) && optionData.length > 0) {
        proposal.options = optionData.map((rawOption: any, idx: number) => {
          const option = parseProposalOption(rawOption, idx);
          const existing = proposal.options.find((o) => o.id === option.id || o.label === option.label);
          return {
            ...option,
            votes: existing?.votes ?? option.votes,
          };
        });
      }
      if (typeof metadata.participation === "number") {
        proposal.participation = metadata.participation;
      }
      if (typeof metadata.totalVotes === "number") {
        proposal.totalVoters = metadata.totalVotes;
      }
    }
  }

  return proposal;
};

export default function GovernancePage() {
  const { isConnected, publicKey, networkPassphrase, poolBalances } =
    useStellarWallet();
  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [voting, setVoting] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingVoteCheck, setLoadingVoteCheck] = useState<
    Record<string, boolean>
  >({});
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [proposalError, setProposalError] = useState<string>("");

  const resolveTokenBalance = useCallback(
    async (poolId: string) => {
      const directBalance = await getTokenBalance(publicKey || "", poolId);
      if (directBalance > 0) return directBalance;

      const assetCode = poolIdToAssetCode(poolId).toUpperCase();
      const matchingBalance = poolBalances.find((balance) => {
        const currentCode = balance.assetCode.toUpperCase();
        return (
          currentCode === assetCode ||
          currentCode.includes(assetCode) ||
          assetCode.includes(currentCode)
        );
      });
      return matchingBalance?.balance ?? 0;
    },
    [publicKey, poolBalances],
  );

  // Load governance proposals from Soroban contract and IPFS metadata
  useEffect(() => {
    if (!publicKey) return;

    let cancelled = false;

    const loadProposals = async () => {
      setLoadingProposals(true);
      setProposalError("");

      try {
        const apiRes = await fetch("/api/pools");
        if (!apiRes.ok) {
          throw new Error("Gagal memuat daftar pool");
        }
        const data = await apiRes.json();
        const pools = Array.isArray(data.pools) ? data.pools : [];

        const rawProposalGroups = await Promise.all(
          pools.map(async (pool: any) => {
            const proposals = await getGovernanceProposals(pool.id, publicKey);
            return Array.isArray(proposals)
              ? proposals.map((item) => ({ poolId: pool.id, item }))
              : [];
          }),
        );

        const rawProposals = rawProposalGroups.flat();
        if (rawProposals.length === 0) {
          return;
        }

        const enriched = await Promise.all(
          rawProposals.map(async ({ poolId, item }) => {
            const proposal = await parseProposalItem(item, poolId);
            return proposal;
          }),
        );

        const validProposals = enriched.filter((p): p is Proposal => p !== null);
        if (!cancelled && validProposals.length > 0) {
          setProposals(validProposals);
        }
      } catch (err: any) {
        if (!cancelled) {
          setProposalError(err?.message || "Gagal memuat proposal governance");
        }
      } finally {
        if (!cancelled) {
          setLoadingProposals(false);
        }
      }
    };

    void loadProposals();

    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  // Check on-chain vote status when wallet connects
  useEffect(() => {
    if (!publicKey) return;

    let cancelled = false;

    const runCheck = async () => {
      const checked = await Promise.all(
        proposals.map(async (p) => {
          if (p.status !== "active") return p;
          setLoadingVoteCheck((prev) => ({ ...prev, [p.id]: true }));
          const [voteStatus, balance] = await Promise.all([
            hasVotedOnChain(publicKey, p.id),
            resolveTokenBalance(p.poolId),
          ]);
          return {
            ...p,
            myVote: voteStatus.voted ? voteStatus.optionId : null,
            tokenBalance: balance,
          };
        }),
      );

      if (!cancelled) {
        setProposals(checked);
        setLoadingVoteCheck((prev) => {
          const next = { ...prev };
          proposals.forEach((p) => {
            next[p.id] = false;
          });
          return next;
        });
      }
    };

    void runCheck();

    return () => {
      cancelled = true;
    };
  }, [publicKey, resolveTokenBalance]);

  const handleVote = async (proposalId: string, poolId: string) => {
    const optionId = selected[proposalId];
    if (optionId === undefined || !publicKey || !networkPassphrase) return;

    setVoting((prev) => ({ ...prev, [proposalId]: true }));
    setErrors((prev) => ({ ...prev, [proposalId]: "" }));

    const result = await castVoteOnStellar(
      publicKey,
      proposalId,
      poolId,
      optionId,
    );

    if (result.success) {
      setTxHashes((prev) => ({ ...prev, [proposalId]: result.txHash }));
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalId) return p;
          return {
            ...p,
            myVote: optionId,
            myVoteTxHash: result.txHash,
            options: p.options.map((o) =>
              o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
            ),
            participation: Math.min(100, p.participation + 1),
          };
        }),
      );
    } else {
      setErrors((prev) => ({
        ...prev,
        [proposalId]: result.error || "Vote gagal",
      }));
    }
    setVoting((prev) => ({ ...prev, [proposalId]: false }));
  };

  const winningOption = (p: Proposal) => {
    if (p.status !== "ended") return null;
    return p.options.reduce((a, b) => (a.votes > b.votes ? a : b));
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Governance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan token Anda sebagai hak suara dalam pengambilan keputusan
            outlet.
          </p>
        </div>
        {!isConnected && <WalletButton variant="outline" size="sm" />}
      </div>

      {/* Stellar info banner */}
      {isConnected && publicKey && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-800">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>
            Vote Anda dicatat permanen di jaringan <strong>Stellar</strong> —{" "}
            <span className="font-mono text-xs">
              {publicKey.slice(0, 6)}…{publicKey.slice(-4)}
            </span>
          </span>
        </div>
      )}

      {!isConnected && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Hubungkan <strong>Freighter Wallet</strong> untuk memeriksa hak
            suara dan melakukan voting on-chain.
          </span>
        </div>
      )}

      {/* Proposal cards */}
      <div className="space-y-6 mt-4">
        {proposals.map((p) => {
          const isEnded = p.status === "ended";
          const hasVoted = p.myVote !== null;
          const winner = winningOption(p);
          const myVotedOption = p.options.find((o) => o.id === p.myVote);
          const totalVotes = p.options.reduce((s, o) => s + o.votes, 0);
          const isVoting = voting[p.id];
          const checkingVote = loadingVoteCheck[p.id];
          const errMsg = errors[p.id];
          const txHash = txHashes[p.id] || p.myVoteTxHash;
          const noTokens =
            isConnected && (p.tokenBalance ?? 0) <= 0 && !isEnded;

          return (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Card header */}
              <div className="p-6 sm:p-8 pb-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                      isEnded
                        ? "bg-gray-100 text-gray-600"
                        : "bg-blue-100 text-blue-700",
                    )}
                  >
                    {isEnded ? "Selesai" : "Aktif"}
                  </span>
                  {!isEnded && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                      <Clock className="w-3 h-3" /> Deadline: {p.deadline}
                    </div>
                  )}
                  {hasVoted && txHash && (
                    <a
                      href={getStellarExpertUrl(txHash, "tx")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-medium flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> On-chain
                    </a>
                  )}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {p.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {p.description}
                </p>

                {/* Participation bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Partisipasi · {totalVotes} suara
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {p.participation}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${p.participation}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3">
                {p.options.map((opt) => {
                  const pct =
                    totalVotes > 0
                      ? Math.round((opt.votes / totalVotes) * 100)
                      : 0;
                  const isWinner = winner?.id === opt.id;
                  const isMyChoice = p.myVote === opt.id;
                  const isSelected = selected[p.id] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        !isEnded &&
                        !hasVoted &&
                        setSelected((s) => ({ ...s, [p.id]: opt.id }))
                      }
                      disabled={isEnded || hasVoted || !isConnected || noTokens}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 overflow-hidden transition-all",
                        isEnded || hasVoted || !isConnected
                          ? "cursor-default"
                          : "cursor-pointer hover:border-blue-300",
                        isMyChoice
                          ? "border-blue-500 bg-blue-50"
                          : isSelected && !hasVoted
                            ? "border-blue-400 bg-blue-50/50"
                            : isWinner && isEnded
                              ? "border-green-400 bg-green-50"
                              : "border-gray-100 bg-white",
                      )}
                    >
                      <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {isMyChoice ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : isSelected && !hasVoted ? (
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex-shrink-0" />
                          ) : isWinner && isEnded ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isMyChoice
                                ? "text-blue-800"
                                : isWinner && isEnded
                                  ? "text-green-800"
                                  : "text-gray-800",
                            )}
                          >
                            {opt.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-600 shrink-0">
                          {pct}%
                        </span>
                      </div>
                      {/* Vote bar */}
                      <div className="h-1.5 w-full bg-gray-100">
                        <div
                          className={cn(
                            "h-full transition-all duration-700",
                            isMyChoice
                              ? "bg-blue-500"
                              : isWinner && isEnded
                                ? "bg-green-500"
                                : "bg-gray-300",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}

                {/* Error */}
                {errMsg && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errMsg}
                  </div>
                )}

                {/* No token warning */}
                {noTokens && !checkingVote && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Anda tidak memiliki token pool ini — tidak dapat voting.
                  </div>
                )}

                {/* Action */}
                <div className="pt-2">
                  {isEnded ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-sm text-gray-500">
                        Hasil akhir:
                      </span>
                      <span className="font-bold text-green-700">
                        {winner?.label}
                      </span>
                    </div>
                  ) : hasVoted ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Suara Anda: <strong>{myVotedOption?.label}</strong>
                        </p>
                        {txHash && (
                          <a
                            href={getStellarExpertUrl(txHash, "tx")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <ExternalLink className="w-3 h-3" /> Verifikasi
                            on-chain
                          </a>
                        )}
                      </div>
                    </div>
                  ) : !isConnected ? (
                    <WalletButton className="w-full justify-center" />
                  ) : checkingVote ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa
                      status vote…
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleVote(p.id, p.poolId)}
                      disabled={
                        selected[p.id] === undefined || isVoting || noTokens
                      }
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 gap-2 disabled:bg-blue-300"
                    >
                      {isVoting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Menandatangani via Freighter…
                        </>
                      ) : (
                        <>
                          <Vote className="w-4 h-4" /> Kirim Vote ke Stellar
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
