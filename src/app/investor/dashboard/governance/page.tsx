"use client";

import { Button } from "@/components/ui/button";
import { WalletButton } from "@/components/ui/wallet-button";
import {
  Vote, Clock, CheckCircle2, ExternalLink,
  Loader2, AlertCircle, Info, ShieldCheck,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { useStellarWallet } from "@/lib/stellar/context";
import { castVoteOnStellar, fetchProposalFromIPFS, hasVotedOnChain } from "@/lib/stellar/governance";
import { getGovernanceProposals } from "@/lib/stellar/soroban";
import { getTokenBalance, poolIdToAssetCode } from "@/lib/stellar/assets";
import { getStellarExpertUrl } from "@/lib/stellar/network";

// ── Types ─────────────────────────────────────────────────────────────────────

type ProposalOption = { id: number; label: string; votes: number };

type Proposal = {
  id: string;
  poolId: string;
  title: string;
  description: string;
  options: ProposalOption[];
  deadline: string;
  status: "active" | "ended";
  totalVoters: number;
  participation: number;
  myVote: number | null;
  myVoteTxHash?: string;
  tokenBalance?: number;
  descriptionCID?: string;
  winningOptionId?: number | null;
};

/** Raw shape returned from Soroban / IPFS — intentionally loose */
type RawProposalOption = string | {
  id?: number;
  description?: string;
  label?: string;
  text?: string;
  voteCount?: number;
  votes?: number;
  [k: string]: unknown;
};

type RawProposal = {
  id?: string | number;
  poolId?: string;
  title?: string;
  descriptionCID?: string;
  votingEndTime?: number | string | null;
  executed?: boolean;
  winningOptionId?: number | null;
  options?: RawProposalOption[];
  proposalOptions?: RawProposalOption[];
  [k: string]: unknown;
};

type IPFSMetadata = {
  title?: string;
  description?: string;
  options?: RawProposalOption[];
  optionDescriptions?: RawProposalOption[];
  participation?: number;
  totalVotes?: number;
};

// ── Mock fallback ──────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDeadline = (ts: number | string | null): string => {
  if (!ts) return "-";
  let ms = Number(ts);
  if (Number.isNaN(ms)) return String(ts);
  if (ms < 1_000_000_000_000) ms *= 1000;
  return new Date(ms).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

const normalizeStatus = (executed: boolean, ts: number | string | null): "active" | "ended" => {
  if (executed) return "ended";
  if (!ts) return "active";
  let ms = Number(ts);
  if (Number.isNaN(ms)) return "active";
  if (ms < 1_000_000_000_000) ms *= 1000;
  return ms < Date.now() ? "ended" : "active";
};

const parseOption = (raw: RawProposalOption, index: number): ProposalOption => {
  if (typeof raw === "string") return { id: index, label: raw, votes: 0 };
  const id    = Number(raw.id ?? index);
  const label = String(raw.description ?? raw.label ?? raw.text ?? `Pilihan ${index + 1}`);
  const votes = Number(raw.voteCount ?? raw.votes ?? 0);
  return { id: Number.isNaN(id) ? index : id, label, votes: Number.isNaN(votes) ? 0 : votes };
};

const parseProposalItem = async (raw: RawProposal, poolIdOverride: string): Promise<Proposal | null> => {
  const id = String(raw.id ?? "");
  if (!id) return null;

  const poolId         = String(raw.poolId ?? poolIdOverride);
  const title          = String(raw.title ?? "Proposal governance");
  const descriptionCID = String(raw.descriptionCID ?? "");
  const votingEndTime  = raw.votingEndTime ?? null;
  const executed       = Boolean(raw.executed ?? false);
  const winningOptionId = typeof raw.winningOptionId === "number" ? raw.winningOptionId : null;

  const rawOpts = raw.options ?? raw.proposalOptions ?? [];
  let options: ProposalOption[] = Array.isArray(rawOpts)
    ? rawOpts.map(parseOption)
    : [{ id: 0, label: "Setuju", votes: 0 }, { id: 1, label: "Tidak Setuju", votes: 0 }];

  if (options.length === 0) {
    options = [{ id: 0, label: "Setuju", votes: 0 }, { id: 1, label: "Tidak Setuju", votes: 0 }];
  }

  const proposal: Proposal = {
    id, poolId, title, description: "",
    options,
    deadline: formatDeadline(votingEndTime),
    status: normalizeStatus(executed, votingEndTime),
    totalVoters: options.reduce((s, o) => s + o.votes, 0),
    participation: 0, myVote: null,
    descriptionCID: descriptionCID || undefined,
    winningOptionId,
  };

  if (descriptionCID) {
    const meta = await fetchProposalFromIPFS(descriptionCID) as IPFSMetadata | null;
    if (meta) {
      if (meta.title)       proposal.title       = String(meta.title);
      if (meta.description) proposal.description = String(meta.description);
      const optData = meta.options ?? meta.optionDescriptions;
      if (Array.isArray(optData) && optData.length > 0) {
        proposal.options = optData.map((o, i) => {
          const parsed   = parseOption(o, i);
          const existing = proposal.options.find((x) => x.id === parsed.id || x.label === parsed.label);
          return { ...parsed, votes: existing?.votes ?? parsed.votes };
        });
      }
      if (typeof meta.participation === "number") proposal.participation = meta.participation;
      if (typeof meta.totalVotes    === "number") proposal.totalVoters   = meta.totalVotes;
    }
  }

  return proposal;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function GovernancePage() {
  const { isConnected, publicKey, networkPassphrase, poolBalances } = useStellarWallet();

  const [proposals, setProposals] = useState<Proposal[]>(MOCK_PROPOSALS);
  const [voting,           setVoting]           = useState<Record<string, boolean>>({});
  const [selected,         setSelected]         = useState<Record<string, number>>({});
  const [txHashes,         setTxHashes]         = useState<Record<string, string>>({});
  const [errors,           setErrors]           = useState<Record<string, string>>({});
  const [loadingVoteCheck, setLoadingVoteCheck] = useState<Record<string, boolean>>({});

  // Keep a stable ref to the latest proposals list so the vote-check effect
  // doesn't need `proposals` in its dependency array (avoids infinite loop).
  const proposalsRef = useRef<Proposal[]>(proposals);
  useEffect(() => { proposalsRef.current = proposals; }, [proposals]);

  const resolveTokenBalance = useCallback(async (poolId: string): Promise<number> => {
    const direct = await getTokenBalance(publicKey ?? "", poolId);
    if (direct > 0) return direct;
    const code = poolIdToAssetCode(poolId).toUpperCase();
    return poolBalances.find((b) => {
      const c = b.assetCode.toUpperCase();
      return c === code || c.includes(code) || code.includes(c);
    })?.balance ?? 0;
  }, [publicKey, poolBalances]);

  // Load proposals from Soroban + IPFS
  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;

    const load = async () => {
      try {
        let myPools: { id: string }[] = [];
        try {
          const invRes = await fetch(`/api/investments?walletAddress=${publicKey}`);
          if (invRes.ok) {
            const invData = await invRes.json();
            const investments: any[] = invData.investments || [];
            myPools = investments.map(i => ({ id: i.pool?.id || i.poolId }));
          }
        } catch {}

        if (myPools.length === 0) {
          const res = await fetch("/api/pools");
          if (res.ok) {
            const data = await res.json();
            myPools = Array.isArray(data.pools) ? data.pools : [];
          }
        }

        const groups = await Promise.all(
          myPools.map(async (pool) => {
            const items = await getGovernanceProposals(pool.id, publicKey);
            return Array.isArray(items)
              ? items.map((item) => ({ poolId: pool.id, item: item as RawProposal }))
              : [];
          }),
        );

        const flat = groups.flat();
        if (cancelled) return;
        
        if (flat.length === 0) {
          // Fallback to mock proposals but bind them to the user's actual pool IDs so voting works
          if (myPools.length > 0) {
            setProposals(MOCK_PROPOSALS.map((p, i) => ({
              ...p,
              poolId: myPools[i % myPools.length].id,
            })));
          }
          return;
        }

        const parsed = await Promise.all(
          flat.map(({ poolId, item }) => parseProposalItem(item, poolId)),
        );
        const valid = parsed.filter((p): p is Proposal => p !== null);
        if (!cancelled && valid.length > 0) setProposals(valid);
      } catch {
        // fall back to mock data — already set as initial state
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [publicKey]);

  // Check on-chain vote status for each active proposal
  useEffect(() => {
    if (!publicKey) return;
    let cancelled = false;

    const check = async () => {
      const current = proposalsRef.current;
      const checked = await Promise.all(
        current.map(async (p) => {
          if (p.status !== "active") return p;
          setLoadingVoteCheck((prev) => ({ ...prev, [p.id]: true }));
          const [voteStatus, balance] = await Promise.all([
            hasVotedOnChain(publicKey, p.id),
            resolveTokenBalance(p.poolId),
          ]);
          return {
            ...p,
            myVote:       voteStatus.voted ? voteStatus.optionId : null,
            tokenBalance: balance,
          };
        }),
      );
      if (!cancelled) {
        setProposals(checked);
        setLoadingVoteCheck((prev) => {
          const next = { ...prev };
          current.forEach((p) => { next[p.id] = false; });
          return next;
        });
      }
    };

    void check();
    return () => { cancelled = true; };
  }, [publicKey, resolveTokenBalance]);

  const handleVote = async (proposalId: string, poolId: string) => {
    const optionId = selected[proposalId];
    if (optionId === undefined || !publicKey || !networkPassphrase) return;

    setVoting((prev) => ({ ...prev, [proposalId]: true }));
    setErrors((prev) => ({ ...prev, [proposalId]: "" }));

    const result = await castVoteOnStellar(publicKey, proposalId, poolId, optionId);

    if (result.success) {
      setTxHashes((prev) => ({ ...prev, [proposalId]: result.txHash }));
      setProposals((prev) =>
        prev.map((p) =>
          p.id !== proposalId ? p : {
            ...p,
            myVote: optionId,
            myVoteTxHash: result.txHash,
            options: p.options.map((o) => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
            participation: Math.min(100, p.participation + 1),
          },
        ),
      );
    } else {
      setErrors((prev) => ({ ...prev, [proposalId]: result.error ?? "Vote gagal" }));
    }
    setVoting((prev) => ({ ...prev, [proposalId]: false }));
  };

  const winningOption = (p: Proposal) =>
    p.status === "ended" ? p.options.reduce((a, b) => (a.votes > b.votes ? a : b)) : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Governance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gunakan token Anda sebagai hak suara dalam pengambilan keputusan outlet.
          </p>
        </div>
        {!isConnected && <WalletButton variant="outline" size="sm" />}
      </div>

      {isConnected && publicKey && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-800">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>
            Vote Anda dicatat permanen di jaringan <strong>Stellar</strong> —{" "}
            <span className="font-mono text-xs">{publicKey.slice(0, 6)}…{publicKey.slice(-4)}</span>
          </span>
        </div>
      )}

      {!isConnected && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Hubungkan <strong>Freighter Wallet</strong> untuk memeriksa hak suara dan melakukan voting on-chain.</span>
        </div>
      )}

      <div className="space-y-6 mt-4">
        {proposals.map((p) => {
          const isEnded      = p.status === "ended";
          const hasVoted     = p.myVote !== null;
          const winner       = winningOption(p);
          const myVotedOpt   = p.options.find((o) => o.id === p.myVote);
          const totalVotes   = p.options.reduce((s, o) => s + o.votes, 0);
          const isVoting     = voting[p.id];
          const checkingVote = loadingVoteCheck[p.id];
          const errMsg       = errors[p.id];
          const txHash       = txHashes[p.id] || p.myVoteTxHash;
          const noTokens     = isConnected && (p.tokenBalance ?? 0) <= 0 && !isEnded;

          return (
            <div key={p.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 pb-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide",
                    isEnded ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700",
                  )}>
                    {isEnded ? "Selesai" : "Aktif"}
                  </span>
                  {!isEnded && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
                      <Clock className="w-3 h-3" /> Deadline: {p.deadline}
                    </div>
                  )}
                  {hasVoted && txHash && (
                    <a href={getStellarExpertUrl(txHash, "tx")} target="_blank" rel="noopener noreferrer"
                      className="text-[10px] font-medium flex items-center gap-1 text-blue-600 hover:underline">
                      <ExternalLink className="w-3 h-3" /> On-chain
                    </a>
                  )}
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-2">{p.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-5">{p.description}</p>

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Partisipasi · {totalVotes} suara
                    </span>
                    <span className="text-sm font-bold text-gray-900">{p.participation}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${p.participation}%` }} />
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3">
                {p.options.map((opt) => {
                  const pct       = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  const isWinner  = winner?.id === opt.id;
                  const isMyChoice = p.myVote === opt.id;
                  const isSel     = selected[p.id] === opt.id;

                  return (
                    <button key={opt.id}
                      onClick={() => !isEnded && !hasVoted && setSelected((s) => ({ ...s, [p.id]: opt.id }))}
                      disabled={isEnded || hasVoted || !isConnected || noTokens}
                      className={cn(
                        "w-full text-left rounded-2xl border-2 overflow-hidden transition-all",
                        isEnded || hasVoted || !isConnected ? "cursor-default" : "cursor-pointer hover:border-blue-300",
                        isMyChoice ? "border-blue-500 bg-blue-50"
                          : isSel && !hasVoted ? "border-blue-400 bg-blue-50/50"
                          : isWinner && isEnded ? "border-green-400 bg-green-50"
                          : "border-gray-100 bg-white",
                      )}
                    >
                      <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {isMyChoice ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          ) : isSel && !hasVoted ? (
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex-shrink-0" />
                          ) : isWinner && isEnded ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                          )}
                          <span className={cn("text-sm font-medium",
                            isMyChoice ? "text-blue-800" : isWinner && isEnded ? "text-green-800" : "text-gray-800",
                          )}>
                            {opt.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-600 shrink-0">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100">
                        <div className={cn("h-full transition-all duration-700",
                          isMyChoice ? "bg-blue-500" : isWinner && isEnded ? "bg-green-500" : "bg-gray-300",
                        )} style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}

                {errMsg && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />{errMsg}
                  </div>
                )}

                {noTokens && !checkingVote && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Anda tidak memiliki token pool ini — tidak dapat voting.
                  </div>
                )}

                <div className="pt-2">
                  {isEnded ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                      <span className="text-sm text-gray-500">Hasil akhir:</span>
                      <span className="font-bold text-green-700">{winner?.label}</span>
                    </div>
                  ) : hasVoted ? (
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Suara Anda: <strong>{myVotedOpt?.label}</strong>
                        </p>
                        {txHash && (
                          <a href={getStellarExpertUrl(txHash, "tx")} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                            <ExternalLink className="w-3 h-3" /> Verifikasi on-chain
                          </a>
                        )}
                      </div>
                    </div>
                  ) : !isConnected ? (
                    <WalletButton className="w-full justify-center" />
                  ) : checkingVote ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 justify-center py-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memeriksa status vote…
                    </div>
                  ) : (
                    <Button onClick={() => handleVote(p.id, p.poolId)}
                      disabled={selected[p.id] === undefined || isVoting || noTokens}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 gap-2 disabled:bg-blue-300"
                    >
                      {isVoting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Menandatangani via Freighter…</>
                      ) : (
                        <><Vote className="w-4 h-4" /> Kirim Vote ke Stellar</>
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
