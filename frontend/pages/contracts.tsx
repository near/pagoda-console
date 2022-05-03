import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { debounce } from 'lodash-es';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

import BorderSpinner from '@/components/BorderSpinner';
import ProjectSelector from '@/components/ProjectSelector';
import RecentTransactionList from '@/components/RecentTransactionList';
import { useContracts } from '@/hooks/contracts';
import { useDashboardLayout } from '@/hooks/layouts';
import { useSelectedProject } from '@/hooks/selected-project';
import { useIdentity } from '@/hooks/user';
import ContractsPreview from '@/public/contractsPreview.png';
import analytics from '@/utils/analytics';
import Config from '@/utils/config';
import { returnContractAddressRegex } from '@/utils/helpers';
import { authenticatedPost } from '@/utils/http';
import type { Contract, Environment } from '@/utils/types';
import type { NextPageWithLayout } from '@/utils/types';

const Contracts: NextPageWithLayout = () => {
  const { project, environment } = useSelectedProject();

  const user = useIdentity();

  if (!user) {
    return <BorderSpinner />;
  }

  // TODO (NTH) lean into automatic static optimization and rework checks so that the
  // maximum amount of elements can be rendered without environmentId
  return (
    <div className="pageContainer">
      <ProjectSelector />
      {project && environment && <ContractsTable project={project.slug} environment={environment} />}
      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

function ContractsTable(props: { project: string; environment: Environment }) {
  const { contracts, error, mutate: mutateContracts } = useContracts(props.project, props.environment.subId);
  // TODO determine how to not retry on 400s
  const [isEditing, setIsEditing] = useState(false);

  // these variables might seem redundant, but there are three states we need
  // to represent
  // 1. there are contracts being tracked
  // 2. there are no contracts being tracked
  // 3. we do not yet know if there are contracts being tracked
  //
  // instead of representing this with true/false/null and potentially
  // slipping up on a falsy check where false and null are mixed up, let's
  // check truthiness on these two
  const hasNoContracts = Boolean(contracts && !contracts.length);
  const hasContracts = Boolean(contracts && contracts.length);

  useEffect(() => {
    if (hasNoContracts) {
      setIsEditing(false);
    }
  }, [hasNoContracts]);

  if (hasNoContracts) {
    return (
      <ContractsEmptyState project={props.project} environment={props.environment} mutateContracts={mutateContracts} />
    );
  }

  if (!contracts && !error) {
    //loading
    return <BorderSpinner />;
  }
  if (error) {
    // TODO
    return <div>Something went wrong: {error.message}</div>;
  }

  return (
    <div className="contractsTableContainer">
      <div className="headerRow">
        <h2>Contracts</h2>
        {hasContracts && <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>}
      </div>
      {hasContracts && (
        <div className="tableGrid">
          <span />
          <span className="label">Account Balance</span>
          <span className="label">Storage Used</span>
          {isEditing && <span></span>}
          {contracts &&
            contracts.map((contract) => (
              <ContractRow
                key={contract.address}
                contract={contract}
                showDelete={isEditing}
                onDelete={mutateContracts}
              />
            ))}
        </div>
      )}
      <AddContractForm project={props.project} environment={props.environment} onAdd={mutateContracts} />
      {hasContracts && (
        <div className="transactionsWrapper">
          <RecentTransactionList contracts={contracts!} net={props.environment.net} />
        </div>
      )}

      <style jsx>{`
        .headerRow {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .tableGrid {
          display: grid;
          row-gap: 0.5rem;
          margin: 0 0 1rem;
          align-items: center;
          row-gap: 1rem;
        }
        .label {
          text-align: right;
          font-weight: 700;
        }
        .contractsTableContainer {
          /* max-width: 46rem; */
        }
        .tableGrid :global(.btn) {
          width: 3rem;
          margin-left: auto;
        }
        .transactionsWrapper {
          margin-top: 3rem;
        }
      `}</style>
      <style jsx>{`
        .tableGrid {
          grid-template-columns: auto 10rem 10rem ${isEditing ? ' 6rem' : ''};
        }
      `}</style>
    </div>
  );
}

function ContractsEmptyState({
  project,
  environment,
  mutateContracts,
}: {
  project: string;
  environment: Environment;
  mutateContracts: () => void;
}) {
  return (
    <div className="emptyStateContainer">
      <div className="imageContainer">
        <Image src={ContractsPreview} alt="Preview of populated contracts page" />
      </div>
      <div className="onboarding">
        <div className="onboardingText">
          <span className="boldText">To see focused explorer views and aggregate transactions: </span>
          <span>add contracts to this project. </span>
        </div>
        <AddContractForm project={project} environment={environment} onAdd={mutateContracts} />
      </div>
      <style jsx>{`
        .emptyStateContainer {
          display: flex;
          flex-direction: row;
          column-gap: 1.5rem;
          align-items: center;
        }
        .onboardingText {
          margin-bottom: 1.5rem;
        }
        .boldText {
          font-weight: 700;
        }
        .imageContainer,
        .onboarding {
          width: 50%;
        }
        a {
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
}

interface AddContractFormData {
  contractAddress: string;
}

function AddContractForm(props: { project: string; environment: Environment; onAdd: () => void }) {
  const { register, handleSubmit, formState, setValue } = useForm<AddContractFormData>();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');
  const contractAddressRegex = returnContractAddressRegex(props.environment);

  function closeAddForm() {
    setValue('contractAddress', '');
    setShowAddForm(false);
  }

  const submitNewContract: SubmitHandler<AddContractFormData> = async ({ contractAddress }) => {
    try {
      setError('');
      const contract = await authenticatedPost('/projects/addContract', {
        project: props.project,
        environment: props.environment.subId,
        address: contractAddress,
      });
      analytics.track('DC Add Contract', {
        status: 'success',
        contractId: contractAddress,
        net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
      });
      props.onAdd();
      closeAddForm();
      return contract;
    } catch (e: any) {
      analytics.track('DC Add Contract', {
        status: 'failure',
        error: e.message,
        contractId: contractAddress,
        net: props.environment.subId === 2 ? 'MAINNET' : 'TESTNET',
      });
      setError(e.message);
    }
  };

  return (
    <>
      <Form noValidate onSubmit={handleSubmit(submitNewContract)}>
        <fieldset className="addContainer" disabled={formState.isSubmitting}>
          {showAddForm && (
            <div className="inputRow">
              <Form.Control
                isInvalid={!!formState.errors.contractAddress}
                placeholder={props.environment.net === 'MAINNET' ? 'contract.near' : 'contract.testnet'}
                {...register('contractAddress', {
                  required: 'Address field is required',
                  pattern: {
                    value: contractAddressRegex,
                    message: 'Invalid address format',
                  },
                })}
              />
              <Form.Control.Feedback type="invalid">{formState.errors.contractAddress?.message}</Form.Control.Feedback>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="buttonContainer">
            {showAddForm && (
              <>
                <Button type="submit">Confirm</Button>
                <Button onClick={closeAddForm} variant="outline-neutral">
                  Cancel
                </Button>
                <div className="loadingContainer">{formState.isSubmitting && <BorderSpinner />}</div>
              </>
            )}
            {!showAddForm && <Button onClick={() => setShowAddForm(true)}>Add a Contract</Button>}
          </div>
        </fieldset>
      </Form>

      <style jsx>{`
        .addContainer {
          display: flex;
          flex-direction: column;
          row-gap: 1em;
        }
        .addContainer :global(.alert) {
          margin-bottom: 0;
        }
        .inputRow {
          display: flex;
          flex-direction: column;
        }
        .loadingContainer {
          margin: 0 0 0 auto;
        }
        .buttonContainer {
          display: flex;
          flex-direction: row;
          column-gap: 0.75rem;
          align-items: center;
        }
      `}</style>
    </>
  );
}

function ContractRow(props: { contract: Contract; showDelete: boolean; onDelete: () => void }) {
  const [canDelete, setCanDelete] = useState(true);
  const { data, error } = useSWR(
    [props.contract.address, props.contract.net],
    async (address) => {
      const res = await fetch(Config.url.rpc.default[props.contract.net], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: address,
          },
        }),
      }).then((res) => res.json());
      if (res.error) {
        // TODO decide whether to retry error
        throw new Error(res.error.name);
      }
      return res;
    },
    {
      // TODO decide whether to retry error
      shouldRetryOnError: false,
    },
  );

  async function removeContractRaw() {
    setCanDelete(false);
    try {
      await authenticatedPost('/projects/removeContract', {
        id: props.contract.id,
      });
      analytics.track('DC Remove Contract', {
        status: 'success',
        contractId: props.contract.address,
      });
      props.onDelete && props.onDelete();
    } catch (e: any) {
      analytics.track('DC Remove Contract', {
        status: 'failure',
        contractId: props.contract.address,
        error: e.message,
      });
      // TODO
      console.error(e);
      setCanDelete(true);
    }
  }

  const removeContract = useMemo(
    () => debounce(removeContractRaw, Config.buttonDebounce, { leading: true, trailing: false }),
    [],
  );

  return (
    <>
      <a
        onClick={() => analytics.track('DC View contract in Explorer')} // TODO CHECK
        className="explorerLink"
        href={`https://explorer${props.contract.net === 'TESTNET' ? '.testnet' : ''}.near.org/accounts/${
          props.contract.address
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.contract.address}
      </a>
      {data ? (
        <span className="data">{(data.result.amount / 10 ** 24).toFixed(5)} Ⓝ</span>
      ) : !error ? (
        <BorderSpinner />
      ) : (
        <span className="data">N/A</span>
      )}
      {data ? (
        <span className="data">{data.result.storage_usage} B</span>
      ) : !error ? (
        <BorderSpinner />
      ) : (
        <span className="data">N/A</span>
      )}
      {props.showDelete && (
        <Button variant="outline-danger" onClick={() => removeContract()} disabled={!canDelete}>
          <FontAwesomeIcon icon={faTrashAlt} />
        </Button>
      )}
      <style jsx>{`
        .explorerLink {
          font-weight: 600;
        }
        .data {
          text-align: right;
          font-family: 'Source Code Pro', monospace;
        }
      `}</style>
    </>
  );
}

Contracts.getLayout = useDashboardLayout;

export default Contracts;
