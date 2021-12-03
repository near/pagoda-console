import { debounce } from 'lodash-es';
import { useDashboardLayout } from "../utils/layouts";
import { Button, Form, Dropdown, DropdownButton } from "react-bootstrap";
import useSWR from "swr";
import { ChangeEvent, FormEvent, useMemo, useState, useEffect } from "react";
import { Contract, Environment, NetOption } from "../utils/interfaces";
import {
  authenticatedPost,
  useContracts,
  useEnvironment,
  useEnvironments,
  useProject
} from "../utils/fetchers";
import { getAuth } from "firebase/auth";
import { useIdentity, useProjectAndEnvironment, useRouteParam } from "../utils/hooks";
import router, { useRouter } from "next/router";
import BorderSpinner from "../components/BorderSpinner";
import EnvironmentSelector from "../components/EnvironmentSelector";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'

import Config from '../utils/config';
import ProjectSelector from '../components/ProjectSelector';

// TODO decide proper crash if environment variables are not defined
// and remove unsafe type assertion
const MAIN_NET_RPC = process.env.NEXT_PUBLIC_MAIN_NET_RPC!;
const TEST_NET_RPC = process.env.NEXT_PUBLIC_TEST_NET_RPC!;

export default function Contracts() {
  const { project, environment } = useProjectAndEnvironment();

  let user = useIdentity();

  if (!user) {
    return <BorderSpinner />;
  }

  // TODO (NTH) lean into automatic static optimization and rework checks so that the
  // maximum amount of elements can be rendered without environmentId
  return (
    <div className="pageContainer">
      <ProjectSelector />
      {project && environment && (
        <ContractsTable project={project.slug} environment={environment} />
      )}
      <style jsx>{`
        .pageContainer {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}

function ContractsTable(props: { project: string; environment: Environment }) {
  const {
    contracts,
    error,
    mutate: mutateContracts,
  } = useContracts(props.project, props.environment.subId);
  // TODO determine how to not retry on 400s
  let [isEditing, setIsEditing] = useState<boolean>(false);

  if (!contracts && !error) {
    //loading
    return <BorderSpinner />;
  }
  if (error) {
    // TODO
    return <div>Something went wrong: {error.message}</div>;
  }
  // if (contracts && !contracts.length) {
  //   return <ContractsEmptyState />;
  // }
  const hasContracts = Boolean(contracts && contracts.length);
  return (
    <div className="contractsTableContainer">
      <div className="headerRow">
        <h2>Contracts</h2>
        {hasContracts && <Button onClick={() => setIsEditing(!isEditing)}>{!isEditing ? 'Edit' : 'Done'}</Button>}
      </div>
      {hasContracts && <div className="tableGrid">
        <span />
        <span className="label">Account Balance</span>
        <span className="label">Storage Used</span>
        {isEditing && <span></span>}
        {contracts &&
          contracts.map((contract) => (
            <ContractRow key={contract.address} contract={contract} showDelete={isEditing} onDelete={mutateContracts} />
          ))}
      </div>}
      <AddContractForm
        project={props.project}
        environment={props.environment}
        onAdd={mutateContracts}
      />

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
            background-color: transparent;
            color: var(--color-primary);
            width: 3rem;
            margin-left: auto;
        }
      `}</style>
      <style jsx>{`
        .tableGrid {
          grid-template-columns: auto 10rem 10rem${isEditing ? ' 6rem' : ''};
        }
      `}</style>
    </div>
  );
}

function ContractsEmptyState() {
  return <div>No contracts</div>;
}

// TODO make placeholder net sensitive
function AddContractForm(props: {
  project: string;
  environment: Environment;
  onAdd: () => void;
}) {
  let [showAdd, setShowAdd] = useState<boolean>(false);
  let [addInProgress, setAddInProgress] = useState<boolean>(false);
  let [address, setAddress] = useState<string>("");
  let [error, setError] = useState<string>("");

  async function submitNewContract(e?: FormEvent) {
    if (e) {
      e.preventDefault();
    }
    setAddInProgress(true);
    let contract: Contract;
    try {
      // throw new Error();
      contract = await authenticatedPost("/projects/addContract", {
        project: props.project,
        environment: props.environment.subId,
        address,
      });
      // contract = await authenticatedPost('/projects/addContract', { environmentId: 40, address });
      props.onAdd();
      closeAdd();
      return contract;
    } catch (e: any) {
      // TODO handle error!
      // alert(e.message);
      setError(e.message);
    } finally {
      setAddInProgress(false);
    }
  }

  function handleAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    error && setError("");
    setAddress(e.target.value);
  }

  function closeAdd() {
    setAddress("");
    setShowAdd(false);
  }

  return (
    <div className="addContainer">
      {showAdd && (
        <div className="inputRow">
          <Form onSubmit={submitNewContract}>
            <Form.Control
              isInvalid={Boolean(error)}
              disabled={addInProgress}
              placeholder="contract.near"
              value={address}
              onChange={handleAddressChange}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form>
          <div className="loadingContainer">
            {addInProgress && <BorderSpinner />}
          </div>
        </div>
      )}
      <div className="buttonContainer">
        <Button
          disabled={addInProgress}
          onClick={showAdd ? submitNewContract : () => setShowAdd(true)}
        >
          {showAdd ? "Confirm" : "Add a Contract"}
        </Button>
        {showAdd && (
          <Button disabled={addInProgress} onClick={closeAdd}>
            Cancel
          </Button>
        )}
      </div>
      <style jsx>{`
        .addContainer {
          display: flex;
          flex-direction: column;
          row-gap: 1em;
        }
        .inputRow {
          display: flex;
          flex-direction: row;
          column-gap: 1rem;
          align-items: center;
        }
        .loadingContainer {
          width: 3rem;
        }
        .buttonContainer {
          display: flex;
          flex-direction: row;
          column-gap: 0.75rem;
        }
      `}</style>
    </div>
  );
}

function ContractRow(props: { contract: Contract, showDelete: boolean, onDelete: Function }) {
  let [canDelete, setCanDelete] = useState<boolean>(true);
  const { data, error } = useSWR(
    [props.contract.address, props.contract.net],
    async (address: string) => {
      const res = await fetch(
        props.contract.net === "MAINNET" ? MAIN_NET_RPC : TEST_NET_RPC,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "dontcare",
            method: "query",
            params: {
              request_type: "view_account",
              finality: "final",
              account_id: address,
            },
          }),
        }
      ).then((res) => res.json());
      if (res.error) {
        // TODO decide whether to retry error
        throw new Error(res.error.name);
      }
      return res;
    },
    {
      // TODO decide whether to retry error
      shouldRetryOnError: false,
    }
  );

  async function removeContractRaw() {
    setCanDelete(false);
    try {
      await authenticatedPost('/projects/removeContract', {
        id: props.contract.id
      });
      props.onDelete && props.onDelete();
    } catch (e) {
      // TODO
      console.error(e);
      setCanDelete(true);
    }
  }

  const removeContract = useMemo(() => debounce(removeContractRaw, Config.buttonDebounce, { leading: true, trailing: false }), []);

  return (
    <>
      <a
        className="explorerLink"
        href={`https://explorer${props.contract.net === "TESTNET" ? ".testnet" : ""
          }.near.org/accounts/${props.contract.address}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.contract.address}
      </a>
      {data ? (
        <span className="data">
          {(data.result.amount / 10 ** 24).toFixed(5)} Ⓝ
        </span>
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
      {props.showDelete && <Button onClick={() => removeContract()} disabled={!canDelete}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
      <style jsx>{`
        .explorerLink {
          font-weight: 600;
        }
        .data {
          text-align: right;
        }
      `}</style>
    </>
  );
}

Contracts.getLayout = useDashboardLayout;