import { useContext, useEffect, useState } from "react";
import { ClickableContainer, Container, RelatedStack, Stack } from "../Layout";
import { Add } from "../icons/Add";
import { ArrowForward } from "../icons/ArrowForward";
import { Person } from "../PersonCard";
import { Back } from "../icons/Back";
import { ChevronDown } from "../icons/ChevronDown";
import { useAppContext } from "@/pages/[domain]";

import styles from '../../styles/domain/DomainRow.module.css';

export function DomainRow() {
  const { domain, subdomains: [subdomains], toggledSubdomains: [toggledSubdomains, setToggledSubdomains] } = useAppContext();

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
            {subdomains.map((subdomain, subdomainIdx) => <SubdomainStack key={`subdomain_${subdomainIdx}`} subdomainIdx={subdomainIdx} />)}
          </Stack>
        </Stack>
        <Stack surface center w="fit-content" br="1em">
          <Add /> Create Address
        </Stack>
      </Stack>
    </Stack>
  );
}

function SubdomainStack({ subdomainIdx }) {
  const {
    subdomains: [subdomains],
    toggledSubdomains: [toggledSubdomains, setToggledSubdomains],
    selectedAddress: [selectedAddress],
  } = useAppContext();
  const subdomain = subdomains[subdomainIdx];

  const [isExpanded, setExpanded] = useState(toggledSubdomains.has(subdomainIdx));
  return (
    <Stack col>
      <ClickableContainer toggleState={setExpanded} customClasses={[styles.cat, isExpanded && styles.expanded_cat]} highlight={!isExpanded && subdomainIdx === selectedAddress[0]}>
        <ChevronDown customClasses={[styles.chevron]} />
        <Container fill>
          {subdomain.name}
        </Container>
      </ClickableContainer>
      <Container expandable expanded={isExpanded}>
        <Container>
          <AddressesStack subdomainIdx={subdomainIdx} tabbable={isExpanded}/>
        </Container>
      </Container>
    </Stack>
  );
}

function AddressesStack({ tabbable, subdomainIdx, ...props }) {
  const { subdomains: [subdomains] } = useAppContext();
  return (
    <RelatedStack col {...props}>
      {
        subdomains[subdomainIdx].addresses.map((v, addressIdx) => (
          <EmailAddress
            key={`address_${subdomainIdx}_${addressIdx}`}
            subdomainIdx={subdomainIdx}
            addressIdx={addressIdx}
          />
        ))
      }
    </RelatedStack>
  );
}

function EmailAddress(props) {
  const {
    subdomains: [subdomains],
    viewedAddress: [viewedAddress, setViewedAddress],
    selectedAddress: [selectedAddress, setSelectedAddress],
    selectedMail: [selectedMail, setSelectedMail],
  } = useAppContext();
  
  const subdomain = subdomains[props.subdomainIdx];
  const address = subdomain.addresses[props.addressIdx];

  // const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  const isViewed = viewedAddress[0] === props.subdomainIdx && viewedAddress[1] === props.addressIdx;
  const isSelected = selectedAddress[0] === props.subdomainIdx && selectedAddress[1] === props.addressIdx;

  return (
    <Container surface customClasses={[styles.emailaddr, props.selected && styles.selected]} highlight={isSelected && !isViewed}>
      <ClickableContainer onFire={() => setViewedAddress([props.subdomainIdx, props.addressIdx])} customClasses={[styles.actualemail]}>
        <Person name={`${address.name}@${subdomain.name}`} img={address.imgSrc} />
      </ClickableContainer>
      <Container expandable expanded={isViewed}>
        <Container>
          <RelatedStack col>
            {
              address.folders.map((folder, folderidx) => (
                <Stack
                  surface
                  key={folderidx}
                  highlight={isSelected && isViewed && folderidx === selectedAddress[2]}
                  onClick={() => {
                    setSelectedAddress([props.subdomainIdx, props.addressIdx, folderidx])
                    setSelectedMail(null);
                  }}
                >
                  {folder.name}
                </Stack>
              ))
            }
          </RelatedStack>
        </Container>
      </Container>
    </Container>
  );
}
