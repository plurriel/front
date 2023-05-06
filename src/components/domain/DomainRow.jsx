import { useContext, useEffect, useState } from "react";
import { ClickableContainer, Container, RelatedStack, Stack } from "../Layout";
import { Add } from "../icons/Add";
import { ArrowForward } from "../icons/ArrowForward";
import { Person } from "../PersonCard";
import { Back } from "../icons/Back";
import { ChevronDown } from "../icons/ChevronDown";
import { useAppContext } from "@/pages/[domain]";

import styles from '../../styles/domain/DomainRow.module.css';
import { Inbox } from "../icons/Inbox";
import { Send } from "../icons/Send";
import { ReportSpam } from "../icons/ReportSpam";
import { Delete } from "../icons/Delete";

export function DomainRow() {
  const {
    domain,
 } = useAppContext();

  return (
    <Stack col id={styles.address}>
      <RelatedStack surface oneline id={styles.domain}>
        <Container surface oneline>
          <Back block />
        </Container>
        <Stack surface fill oneline>
          <Person name={domain.name} img={domain.imgSrc} />
        </Stack>
      </RelatedStack>
      <Stack col surface fill>
        <Stack scroll fill>
          <Stack col>
            {domain.subdomains.map((subdomainId) => <SubdomainStack key={subdomainId} subdomainId={subdomainId} />)}
          </Stack>
        </Stack>
        <Stack surface center w="fit-content" br="1em">
          <Add /> Create Address
        </Stack>
      </Stack>
    </Stack>
  );
}

function SubdomainStack({ subdomainId }) {
  const {
    subdomains: [subdomains],
    toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
    selectedAddress: [selectedAddress],
  } = useAppContext();

  console.log(subdomains, subdomainId)
  const subdomain = subdomains[subdomainId];

  const isExpanded = toggledSubdomains.has(subdomainId);
  return (
    <Stack col>
      <ClickableContainer onFire={() => {
        setToggledSubdomains((toggledSubdomains) => {
          const newToggledSubdomains = new Set(toggledSubdomains);
          if (toggledSubdomains.has(subdomainId)) {
            newToggledSubdomains.delete(subdomainId);
          } else {
            newToggledSubdomains.add(subdomainId);
          }
          return newToggledSubdomains;
        });
      }} customClasses={[styles.cat, isExpanded && styles.expanded_cat]} highlight={!isExpanded && subdomainId === selectedAddress[0]}>
        <ChevronDown customClasses={[styles.chevron]} />
        <Container fill>
          {subdomain.name}
        </Container>
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <AddressesStack subdomainId={subdomainId} tabbable={isExpanded}/>
        </Container>
      </Container>
    </Stack>
  );
}

function AddressesStack({ tabbable, subdomainId, ...props }) {
  const {
    subdomains: [subdomains],
  } = useAppContext();
  return (
    <RelatedStack col {...props}>
      {
        subdomains[subdomainId].addresses.map((addressId) => (
          <EmailAddress
            key={addressId}
            subdomainId={subdomainId}
            addressId={addressId}
          />
        ))
      }
    </RelatedStack>
  );
}

function EmailAddress({
  subdomainId,
  addressId,
  ...props
}) {
  const {
    subdomains: [subdomains],
    folders: [folders],
    addresses: [addresses],
    viewedAddress: [viewedAddress, setViewedAddress],
    selectedAddress: [selectedAddress, setSelectedAddress],
    selectedMail: [selectedMail, setSelectedMail],
  } = useAppContext();
  
  const subdomain = subdomains[subdomainId];
  const address = addresses[addressId];

  const isViewed = viewedAddress[0] === subdomainId && viewedAddress[1] === addressId;
  const isSelected = selectedAddress[0] === subdomainId && selectedAddress[1] === addressId;

  return (
    <Container surface customClasses={[styles.emailaddr, isSelected && styles.selected]} highlight={isSelected && !isViewed}>
      <ClickableContainer onFire={() => {
        if (isViewed) {
          setViewedAddress([subdomainId, null]);
        } else {
          setViewedAddress([subdomainId, addressId]);
        }
      }} customClasses={[styles.actualemail]}>
        <Person name={`${address.name}@${subdomain.name}`} img={address.imgSrc} />
      </ClickableContainer>
      <Container expandable expanded={isViewed}>
        <Container>
          <RelatedStack col>
            {
              address.folders.map((folderId) => (
                <Stack
                  surface
                  key={folderId}
                  highlight={isSelected && isViewed && folderId === selectedAddress[2]}
                  onClick={() => {
                    setSelectedAddress([subdomainId, addressId, folderId])
                    setSelectedMail(null);
                  }}
                >
                  <RelevantIcon name={folders[folderId].name} /> {folders[folderId].name}
                </Stack>
              ))
            }
          </RelatedStack>
        </Container>
      </Container>
    </Container>
  );
}

export function RelevantIcon ({ name }) {
  switch (name) {
    case 'Inbox':
      return <Inbox />
    case 'Sent':
      return <Send />
    case 'Spam':
      return <ReportSpam />
    case 'Deleted':
      return <Delete />
    default:

  }
}
