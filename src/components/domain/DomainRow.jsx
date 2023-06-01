import React, { useEffect, useState } from 'react';
import { ClickableContainer, Container, Stack } from '../Layout';
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
    <Stack col surface fill id={styles.address} {...props}>
      <Stack surface oneline id={styles.domain}>
        <IconButton icon={Back} />
        <Person name={domain.name} img={domain.imgSrc} />
      </Stack>
      <Stack scroll fill>
        <Stack col>
          {
            domain.subdomains
              .map((subdomainId) => <SubdomainStack key={subdomainId} subdomainId={subdomainId} />)
          }
        </Stack>
      </Stack>
      <Stack jc="flex-end">
        <ClickableContainer toggleState={setShowCreateModal}>
          <Stack surface center w="fit-content" cta>
            <Add />
            {' '}
            Create
          </Stack>
        </ClickableContainer>
        <Modal surface shown={showCreateModal} setShown={setShowCreateModal}>
          <CreateModal modalShown={showCreateModal} setModalShown={setShowCreateModal} />
        </Modal>
      </Stack>
    </Stack>
  );
}

function SelectTag(p) {
  return <select {...p} />;
}

function CreateModal({ modalShown, setModalShown }) {
  const [step, setStep] = useState([0, {}]);
  const {
    domain,
    subdomains: [subdomains],
    selectedAddress: [[selectedSubdomainId]],
  } = useAppContext();

  useEffect(() => {
    if (!modalShown) {
      setStep([0, {}]);
    }
  }, [modalShown]);
  useEffect(() => {
    (async () => {
      if (step[0] === 2) {
        if (step[1].type === 'email') {
          await fetch(`/api/subdomain/${step[1].subdomainId}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subdomainId: step[1].subdomainId,
              name: step[1].val,
            }),
          });
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
              fill
              surface
              highlight={step[1].type === 'email'}
              onFire={() => setStep((step_) => [step_[0], { ...step_[1], type: 'email' }])}
            >
              <Stack col fill>
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
              fill
              surface
              highlight={step[1].type === 'subdomain'}
              onFire={() => setStep((step_) => [step_[0], { ...step_[1], type: 'subdomain' }])}
            >
              <Stack col fill>
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
                {' '}
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
              <Container fill>
                <TextInput
                  w
                  onChange={({ target }) => setStep((step_) => [step_[0], {
                    ...step_[1],
                    val: target.value
                      .toLowerCase()
                      .replace(/ /g, '-')
                      .replace(/[^A-z0-9!#$%&'*+\-/=?^_`{|}~.]|(?<=\.)\./g, ''),
                  }])}
                  value={step[1].val || ''}
                  maxLength={64}
                />
              </Container>
              <Stack surface ai>
                {' '}
                {/* I hate myself for doing this */}
                <Container
                  oneline
                  customTag={SelectTag}
                  onChange={(e) => setStep((step_) => [step_[0], {
                    ...step_[1],
                    subdomainId: e.target.value,
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
                <ChevronDown block />
              </Stack>
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
                  {' '}
                  <ArrowForward block />
                </Stack>
              </ClickableContainer>
            </Stack>
          </>
        );
      }
      return <b>To be done!</b>;

    default:
      requestAnimationFrame(() => setModalShown(false));
      return false;
  }
}

function SubdomainStack({ subdomainId }) {
  const {
    subdomains: [subdomains],
    toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  const subdomain = subdomains[subdomainId];

  const isExpanded = toggledSubdomains.has(subdomainId);
  return (
    <Stack col>
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
        highlight={!isExpanded && subdomainId === selectedAddress?.[0]}
      >
        <ChevronDown customClasses={[styles.chevron]} />
        <Container fill>
          {subdomain.name}
        </Container>
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <AddressesStack subdomainId={subdomainId} tabbable={isExpanded} isShown={isExpanded} />
        </Container>
      </Container>
    </Stack>
  );
}

function AddressesStack({
  tabbable, subdomainId, isShown, ...props
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
}) {
  const {
    folders: [folders],
    addresses: [addresses],
    viewedAddress: [viewedAddress, setViewedAddress],
    selectedAddress: [selectedAddress, setSelectedAddress],
    selectedConvo: [, setSelectedConvo],
    currentFirstPane: [currentFirstPane, setCurrentFirstPane],
  } = useAppContext();

  const address = addresses[addressId];

  const isExpanded = viewedAddress
    && viewedAddress[0] === subdomainId
    && viewedAddress[1] === addressId;
  const isSelected = selectedAddress
    && selectedAddress[0] === subdomainId
    && selectedAddress[1] === addressId;

  return (
    <Container
      {...props}
      surface
      customClasses={[styles.emailaddr, isSelected && styles.selected]}
      highlight={isSelected && !isExpanded}
    >
      <ClickableContainer
        onFire={() => {
          if (isExpanded) {
            setViewedAddress([subdomainId, null]);
          } else {
            setViewedAddress([subdomainId, addressId]);
          }
        }}
        customClasses={[styles.actualemail]}
        br="0.5em"
        unclickable={!isShown}
      >
        <Person name={`${address.name}`} img={address.imgSrc} />
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <Stack related col pad="0.5em 0 0 0">
            {
              address.folders.map((folderId) => (
                <ClickableContainer
                  pad
                  key={folderId}
                  highlight={isExpanded
                    ? (isSelected && folderId === selectedAddress?.[2])
                    : isSelected}
                  onFire={() => {
                    if (!isSelected || selectedAddress[2] !== folderId) {
                      setSelectedAddress([subdomainId, addressId, folderId]);
                      setSelectedConvo(null);
                    }
                    if (currentFirstPane === 0) setCurrentFirstPane(1);
                  }}
                  unclickable={!isExpanded}
                >
                  <RelevantIcon type={folders[folderId].type} />
                  {' '}
                  {folders[folderId].type !== 'Other' ? folders[folderId].type : folders[folderId].name}
                </ClickableContainer>
              ))
            }
          </Stack>
        </Container>
      </Container>
    </Container>
  );
}

export function RelevantIcon({ type }) {
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
