import React, { useEffect, useRef, useState } from 'react';
import { Add } from '@/components/icons/Add';
import { Person } from '@/components/PersonCard';
import { Back } from '@/components/icons/Back';
import { ChevronDown } from '@/components/icons/ChevronDown';
import { useAppContext } from '@/components/domain/AppContext';

import styles from '@/styles/domain/DomainRow.module.css';
import { Inbox } from '@/components/icons/Inbox';
import { Send } from '@/components/icons/Send';
import { ReportSpam } from '@/components/icons/ReportSpam';
import { Delete } from '@/components/icons/Delete';
import { getFolderName } from '@/lib/utils';
import { ClickableContainer, Container, Stack } from '../Layout';
import { IconButton } from '../IconButton';
import { Modal } from '../Modal';
import { Rainbow } from '../Skeleton';
import { TextInput } from '../Input';
import { ArrowForward } from '../icons/ArrowForward';
import { Folder } from '../icons/Folder';

export function DomainRow({ ...props }) {
  const {
    domain,
  } = useAppContext();

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <Stack col surface flexGrow id={styles.address} {...props}>
      <Stack surface oneline id={styles.domain}>
        <IconButton icon={Back} />
        <Person name={domain.name} />
      </Stack>
      <Stack scroll flexGrow>
        <Stack col>
          {
            domain.subdomains
              .map((subdomainId) => <SubdomainStack key={subdomainId} subdomainId={subdomainId} />)
          }
        </Stack>
      </Stack>
      <Stack jc="flex-end">
        <ClickableContainer toggleState={setShowCreateModal} surface cta>
          <Add />
          Create
        </ClickableContainer>
        <Modal surface shown={showCreateModal} setShown={setShowCreateModal}>
          <CreateModal modalShown={showCreateModal} setModalShown={setShowCreateModal} />
        </Modal>
      </Stack>
    </Stack>
  );
}

function CreateModal(
  {
    modalShown,
    setModalShown,
  }: {
    modalShown: boolean,
    setModalShown: React.Dispatch<React.SetStateAction<boolean>>,
  },
) {
  interface SubdomainStepData {
    type: 'subdomain';
    domainId: string;
    val: string;
    code: number;
  }
  interface EmailStepData {
    type: 'email';
    subdomainId: string;
    val: string;
  }
  type StepData = SubdomainStepData | EmailStepData;
  type Step = [number, Partial<StepData>]

  const [step, setStep] = useState<Step>([0, {}]);
  const {
    domain,
    subdomains: [subdomains],
    selectedFolder: [selected],
  } = useAppContext();

  let selectedSubdomainId;
  if (selected) [selectedSubdomainId] = selected;
  else [selectedSubdomainId] = domain.subdomains;

  useEffect(() => {
    if (!modalShown) {
      setStep([0, {}]);
    }
  }, [modalShown]);
  useEffect(() => {
    (async () => {
      if (step[0] === 2) {
        switch (step[1].type) {
          case 'email':
            await fetch(`/api/subdomains/${step[1].subdomainId}/addresses`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                subdomainId: step[1].subdomainId,
                name: step[1].val,
              }),
            });
            break;
          case 'subdomain':
            const request = await fetch(`/api/domains/${step[1].domainId}/subdomains`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                domainId: step[1].domainId,
                name: step[1].val,
              }),
            });
            setStep([step[0], { ...step[1], code: request.status }]);
            break;
          default:
            throw new Error('wtf');
        }
      }
    })();
  }, [step]);

  switch (step[0]) {
    case 0:
      return (
        <>
          <b>Create...</b>
          <Stack related col>
            <ClickableContainer
              flexGrow
              surface
              highlight={step[1].type === 'email'}
              onFire={() => setStep((step_) => [step_[0], { ...step_[1], type: 'email' }])}
            >
              <Stack col flexGrow>
                <span>An email address</span>
                <Stack ai="center" gap="0.25em">
                  <small><Rainbow w="4em" /></small>
                  <small>@</small>
                  <small><Rainbow w="2em" repulse /></small>
                  <small>
                    .
                    {domain.name}
                  </small>
                </Stack>
              </Stack>
            </ClickableContainer>
            <ClickableContainer
              flexGrow
              surface
              highlight={step[1].type === 'subdomain'}
              onFire={() => setStep((step_) => [step_[0], { ...step_[1], type: 'subdomain' }])}
            >
              <Stack col flexGrow>
                <span>A subdomain</span>
                <Stack ai="center" gap="0.25em">
                  <small><Rainbow w="2em" repulse /></small>
                  <small>@</small>
                  <small><Rainbow w="4em" /></small>
                  <small>
                    .
                    {domain.name}
                  </small>
                </Stack>
              </Stack>
            </ClickableContainer>
          </Stack>
          <Stack jc="flex-end">
            <ClickableContainer
              disabled={step[1].type == null}
              surface
              cta
              onFire={() => setStep((step_) => [step_[0] + 1, step_[1]])}
            >
              <Stack>
                Next
                <ArrowForward block />
              </Stack>
            </ClickableContainer>
          </Stack>
        </>
      );
    case 1:
      if (step[1].type === 'email') {
        if (!step[1].subdomainId) {
          setStep([
            step[0],
            { ...step[1], subdomainId: selectedSubdomainId },
          ]);
        }
        return (
          <>
            <span>Email Address</span>
            <Stack related>
              <Container flexGrow>
                <TextInput
                  w
                  onChange={({ target }) => setStep((step_) => [step_[0], {
                    ...step_[1],
                    val: (target as HTMLInputElement).value
                      .toLowerCase()
                      .replace(/ /g, '-')
                      .replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.]|\.(?=\.)/g, ''),
                  }])}
                  value={step[1].val || ''}
                  maxLength={64}
                />
              </Container>
              {/* I hate myself for doing this */}
              <Container
                surface
                oneline
                customTag="select"
                onChange={({ target }) => setStep((step_) => [step_[0], {
                  ...step_[1],
                  subdomainId: (target as HTMLInputElement).value,
                }])}
                defaultValue={selectedSubdomainId}
              >
                {
                  domain.subdomains.map((subdomainId) => (
                    <option value={subdomainId}>
                      @
                      {subdomains[subdomainId].name}
                    </option>
                  ))
                }
              </Container>
              <ChevronDown block customClasses={[styles.subdomain_sel_chevron]} />
            </Stack>
            <Stack jc="flex-end">
              <ClickableContainer
                disabled={!step[1].val}
                surface
                cta
                onFire={() => setStep((step_) => [step_[0] + 1, step_[1]])}
              >
                <Stack>
                  Create
                  <ArrowForward block />
                </Stack>
              </ClickableContainer>
            </Stack>
          </>
        );
      }
      if (step[1].type === 'subdomain') {
        if (!step[1].domainId) {
          setStep([
            step[0],
            { ...step[1], domainId: domain.id },
          ]);
        }
        return (
          <>
            <span>Subdomain</span>
            <Stack related>
              <Container flexGrow>
                <TextInput
                  w
                  onChange={({ target }) => setStep((step_) => [step_[0], {
                    ...step_[1],
                    val: (target as HTMLInputElement).value
                      .toLowerCase()
                      .replace(/ /g, '-')
                      .replace(/[^a-z0-9-]/g, ''),
                  }])}
                  onBlur={() => setStep((step_) => [step_[0], {
                    ...step_[1],
                    val: step_[1].val?.replace(/^-|-$/g, ''),
                  }])}
                  value={step[1].val || ''}
                  maxLength={64}
                />
              </Container>
              <Container surface>
                .
                {domain.name}
              </Container>
            </Stack>
            <Stack jc="flex-end">
              <ClickableContainer
                disabled={!step[1].val}
                surface
                cta
                onFire={() => setStep((step_) => [step_[0] + 1, step_[1]])}
              >
                <Stack>
                  Create
                  <ArrowForward block />
                </Stack>
              </ClickableContainer>
            </Stack>
          </>
        );
      }
      return <b>wtf</b>;
    case 2:
      if (step[1].type === 'subdomain') {
        return (
          <>
            <span>Subdomain</span>
            <b>Subdomain successfully set!</b>
            <Container surface>
              <b>Note</b>
              <span>
                <p>
                  Your subdomain may be deemed as untrustworthy if you don&amp;t set the following
                  DNS record:
                </p>
                <Stack related col>
                  <Stack>
                    <Container surface>
                      <small>Type</small>
                    </Container>
                    <Container surface flexGrow>
                      MX
                    </Container>
                  </Stack>
                  <Stack>
                    <Container surface>
                      <small>Name</small>
                    </Container>
                    <Container surface flexGrow>
                      {subdomains[selectedSubdomainId].name}
                    </Container>
                  </Stack>
                  <Stack>
                    <Container surface>
                      <small>Value</small>
                    </Container>
                    <Container surface flexGrow>
                      mail.plurriel.email
                    </Container>
                  </Stack>
                  <Stack>
                    <Container surface>
                      <small>Priority</small>
                    </Container>
                    <Container surface flexGrow>
                      5
                    </Container>
                  </Stack>
                </Stack>
                <p>
                  You should be able to send and receive either way, this is only a precaution to
                  not end up in the Spam foldeer.
                </p>
              </span>
            </Container>
          </>
        );
      }
    default:
      requestAnimationFrame(() => setModalShown(false));
      return null;
  }
}

function SubdomainStack({ subdomainId }: { subdomainId: string }) {
  const {
    subdomains: [subdomains],
    toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
    selectedFolder: [selectedFolder],
    requestedSubdomain: [requestedSubdomain, setRequestedSubdomain],
  } = useAppContext();
  const subdomainCat = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (requestedSubdomain === subdomainId) {
      if (subdomainCat.current) subdomainCat.current.scrollIntoView({ behavior: 'smooth' });
      setRequestedSubdomain(null);
    }
  }, [subdomainCat, requestedSubdomain]);

  const subdomain = subdomains[subdomainId];

  const isExpanded = toggledSubdomains.has(subdomainId);
  return (
    <Container customClasses={[styles.fullheight_last_subdomain]}>
      <Stack col>
        <div ref={subdomainCat}>
          <ClickableContainer
            onFire={() => {
              setToggledSubdomains((toggledSubdomains_) => {
                const newToggledSubdomains = new Set(toggledSubdomains_);
                if (toggledSubdomains_.has(subdomainId)) {
                  newToggledSubdomains.delete(subdomainId);
                } else {
                  newToggledSubdomains.add(subdomainId);
                }
                return newToggledSubdomains;
              });
            }}
            customClasses={[styles.cat, isExpanded && styles.expanded_cat]}
            highlight={!isExpanded && subdomainId === selectedFolder?.[0]}
          >
            <ChevronDown customClasses={[styles.chevron]} />
            <Container flexGrow>
              {subdomain.name}
            </Container>
          </ClickableContainer>
        </div>
        <Container expandable expanded={isExpanded}>
          <Container>
            <AddressesStack subdomainId={subdomainId} tabbable={isExpanded} isShown={isExpanded} />
          </Container>
        </Container>
      </Stack>
    </Container>
  );
}

function AddressesStack({
  tabbable,
  subdomainId,
  isShown,
  ...props
}: {
  tabbable: boolean,
  subdomainId: string,
  isShown: boolean,
}) {
  const {
    subdomains: [subdomains],
  } = useAppContext();

  return (
    <Stack related col {...props}>
      {
        subdomains[subdomainId].addresses.map((addressId) => (
          <EmailAddress
            key={addressId}
            subdomainId={subdomainId}
            addressId={addressId}
            isShown={isShown}
          />
        ))
      }
    </Stack>
  );
}

function EmailAddress({
  subdomainId,
  addressId,
  isShown,
  ...props
}: {
  subdomainId: string,
  addressId: string,
  isShown: boolean,
}) {
  const {
    folders: [folders],
    addresses: [addresses],
    viewedAddress: [viewedAddress, setViewedAddress],
    selectedFolder: [selectedFolder, setSelectedFolder],
    selectedConvo: [, setSelectedConvo],
    currentFirstPane: [currentFirstPane, setCurrentFirstPane],
  } = useAppContext();

  const address = addresses[addressId];

  const isExpanded = viewedAddress
    && viewedAddress[0] === subdomainId
    && viewedAddress[1] === addressId;
  const isSelected = selectedFolder
    && selectedFolder[0] === subdomainId
    && selectedFolder[1] === addressId;

  return (
    <Container
      {...props}
      surface
      customClasses={[styles.emailaddr, isSelected && styles.selected]}
      highlight={(isSelected && !isExpanded) ?? undefined}
    >
      <ClickableContainer
        onFire={() => {
          if (isExpanded) {
            setViewedAddress(null);
          } else {
            setViewedAddress([subdomainId, addressId]);
          }
        }}
        customClasses={[styles.actualemail]}
        br="0.5em"
        unclickable={!isShown}
        highlight={(isSelected && !isExpanded) ?? undefined}
      >
        <Person name={`${address.name}`} />
      </ClickableContainer>
      <Container expandable expanded={isExpanded ?? undefined}>
        <Container>
          <Stack related col pad="0.5em 0 0 0">
            {
              address.folders.map((folderId) => (
                <ClickableContainer
                  pad
                  key={folderId}
                  highlight={isExpanded
                    ? (isSelected && folderId === selectedFolder?.[2]) ?? undefined
                    : isSelected ?? undefined}
                  onFire={() => {
                    if (!isSelected || selectedFolder[2] !== folderId) {
                      setSelectedFolder([subdomainId, addressId, folderId]);
                      window.history.pushState({}, '', `/${addresses[addressId].name}/${getFolderName(folders[folderId])}`);
                      setSelectedConvo(null);
                    }
                    if (currentFirstPane === 0) setCurrentFirstPane(1);
                  }}
                  unclickable={!isExpanded}
                >
                  <RelevantIcon type={folders[folderId].type} />
                  {getFolderName(folders[folderId])}
                </ClickableContainer>
              ))
            }
          </Stack>
        </Container>
      </Container>
    </Container>
  );
}

export function RelevantIcon({ type }: { type: string }) {
  switch (type) {
    case 'Inbox':
      return <Inbox />;
    case 'Sent':
      return <Send />;
    case 'Spam':
      return <ReportSpam />;
    case 'Deleted':
      return <Delete />;
    default:
      return <Folder />;
  }
}
