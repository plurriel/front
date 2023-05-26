import { ClickableContainer, Container, Stack } from "../Layout";
import { Add } from "@/components/icons/Add";
import { Person } from "@/components/PersonCard";
import { Back } from "@/components/icons/Back";
import { ChevronDown } from "@/components/icons/ChevronDown";
import { useAppContext } from "@/components/domain/AppContext";

import styles from '@/styles/domain/DomainRow.module.css';
import { Inbox } from "@/components/icons/Inbox";
import { Send } from "@/components/icons/Send";
import { ReportSpam } from "@/components/icons/ReportSpam";
import { Delete } from "@/components/icons/Delete";
import { IconButton } from "../IconButton";
import { Modal } from "../Modal";

export function DomainRow({ ...props }) {
  const {
    domain,
 } = useAppContext();

  return (
    <Stack col surface fill id={styles.address} {...props}>
      <Stack surface oneline id={styles.domain}>
        <IconButton icon={Back} />
        <Person name={domain.name} img={domain.imgSrc} />
      </Stack>
      <Stack scroll fill>
        <Stack col>
          {domain.subdomains.map((subdomainId) => <SubdomainStack key={subdomainId} subdomainId={subdomainId} />)}
        </Stack>
      </Stack>
      <Stack jc="flex-end">
        <ClickableContainer>
          <Stack surface center w="fit-content" cta>
            <Add /> Create
          </Stack>
        </ClickableContainer>
        <Modal>

        </Modal>
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
      }} customClasses={[styles.cat, isExpanded && styles.expanded_cat]} highlight={!isExpanded && subdomainId === selectedAddress?.[0]}>
        <ChevronDown customClasses={[styles.chevron]} />
        <Container fill>
          {subdomain.name}
        </Container>
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <AddressesStack subdomainId={subdomainId} tabbable={isExpanded} isShown={isExpanded}/>
        </Container>
      </Container>
    </Stack>
  );
}

function AddressesStack({ tabbable, subdomainId, isShown, ...props }) {
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
    subdomains: [subdomains],
    folders: [folders],
    addresses: [addresses],
    viewedAddress: [viewedAddress, setViewedAddress],
    selectedAddress: [selectedAddress, setSelectedAddress],
    selectedMail: [selectedMail, setSelectedMail],
    currentFirstPane: [currentFirstPane, setCurrentFirstPane],
  } = useAppContext();
  
  const subdomain = subdomains[subdomainId];
  const address = addresses[addressId];

  const isExpanded = viewedAddress[0] === subdomainId
    && viewedAddress[1] === addressId;
  const isSelected = selectedAddress
    && selectedAddress[0] === subdomainId
    && selectedAddress[1] === addressId;

  return (
    <Container surface customClasses={[styles.emailaddr, isSelected && styles.selected]} highlight={isSelected && !isExpanded}>
      <ClickableContainer onFire={() => {
        if (isExpanded) {
          setViewedAddress([subdomainId, null]);
        } else {
          setViewedAddress([subdomainId, addressId]);
        }
      }} customClasses={[styles.actualemail]} br="0.5em" unclickable={!isShown}>
        <Person name={`${address.name}@${subdomain.name}`} img={address.imgSrc} />
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <Stack related col pad="0.5em 0 0 0">
            {
              address.folders.map((folderId) => (
                <ClickableContainer
                  pad
                  key={folderId}
                  highlight={isExpanded ? (isSelected && folderId === selectedAddress?.[2]) : isSelected}
                  onFire={() => {
                    if (!isSelected || selectedAddress[2] !== folderId) {
                      setSelectedAddress([subdomainId, addressId, folderId])
                      setSelectedMail(null);
                    }
                    if (currentFirstPane === 0) setCurrentFirstPane(1);
                  }}
                  unclickable={!isExpanded}
                >
                  <RelevantIcon name={folders[folderId].name} /> {folders[folderId].name}
                </ClickableContainer>
              ))
            }
          </Stack>
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
