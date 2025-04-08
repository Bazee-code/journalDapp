'use client';

import { getCruddappProgram, getCruddappProgramId } from '@project/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

interface createEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

interface updateEntryArgs {
  title: string;
  message: string;
}

export const useCruddappProgram = () => {
  const { connection } = useConnection();
  console.log('connectionssss', connection);
  const { cluster } = useCluster();
  const { wallets, select } = useWallet();
  console.log('show wallets', wallets);
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getCruddappProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getCruddappProgram(provider, programId),
    [provider, programId]
  );

  console.log('programmm', program);

  const accounts = useQuery({
    queryKey: ['cruddapp', 'all', { cluster }],
    queryFn: () => program.account.cruddapp.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, createEntryArgs>({
    mutationKey: ['journalEntry', 'create', { cluster }],
    mutationFn: async ({ title, message, owner }) => {
      return program.methods.createJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error creating entry, ${error?.message}`);
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry,
  };
};

// export const useCruddappProgram = () => {
//   return console.log('CruddappProgram');
// };

// export const useCruddappProgramAccount = ({
//   account,
// }: {
//   account: PublicKey;
// }) => {
//   return console.log('useCruddappProgramAccount');
// };

export function useCruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useCruddappProgram();

  const accountQuery = useQuery({
    queryKey: ['cruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.cruddapp.fetch(account),
  });

  const updateEntry = useMutation<string, Error, updateEntryArgs>({
    mutationKey: ['journalEntry', 'update', { cluster }],
    mutationFn: async ({ title, message }) => {
      return program.methods.updateJournalEntry(title, message).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error updating entry: ${error.message}`);
    },
  });

  const deleteEntry = useMutation<string, Error, updateEntryArgs>({
    mutationKey: ['journalEntry', 'delete', { cluster }],
    mutationFn: ({ title }) => {
      return program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error deleting entry: ${error.message}`);
    },
  });

  return {
    accountQuery,
    updateEntry,
    deleteEntry,
  };
}
