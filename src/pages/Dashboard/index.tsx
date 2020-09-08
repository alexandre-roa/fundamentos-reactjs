import React, { useState, useEffect, useCallback } from 'react';
import { FiTrash2 } from 'react-icons/fi';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';
import { useToast } from '../../hooks/toast';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import {
  Container,
  CardContainer,
  Card,
  TableContainer,
  DeleteButton,
} from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      try {
        const response = await api.get('transactions');

        const transactionsFormatted = response.data.transactions.map(
          (transaction: Transaction) => ({
            ...transaction,
            formattedValue: formatValue(transaction.value),
            formattedDate: new Date(transaction.created_at).toLocaleDateString(
              'pt-br',
            ),
          }),
        );

        const balanceFormatted = {
          income: formatValue(response.data.balance.income),
          outcome: formatValue(response.data.balance.outcome),
          total: formatValue(response.data.balance.total),
        };

        setTransactions(transactionsFormatted);
        setBalance(balanceFormatted);
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Erro em carregar as transações',
          description: 'Verifique a conexão com a internet',
        });
      }
    }

    loadTransactions();
  }, [addToast]);

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      await api.delete(`transactions/${id}`);

      addToast({
        type: 'error',
        title: 'Transação deletada',
      });
    },
    [addToast],
  );

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            {transactions &&
              transactions.map(transaction => (
                <tbody key={transaction.id}>
                  <tr>
                    <td className="title">{transaction.title}</td>

                    {transaction.type === 'income' ? (
                      <td className="income">{transaction.formattedValue}</td>
                    ) : (
                      <td className="outcome">
                        - {transaction.formattedValue}
                      </td>
                    )}

                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                    <td>
                      <DeleteButton
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <FiTrash2 size={20} />
                      </DeleteButton>
                    </td>
                  </tr>
                </tbody>
              ))}
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
