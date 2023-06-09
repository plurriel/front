import React from 'react';
import { Container, Stack } from '../Layout';
import { Logo } from '../Logo';
import { IconButton } from '../IconButton';
import { Search } from '../icons/Search';

export function TopBar({ ...props }) {
  return (
    <Stack {...props} surface pad="0.5em 1em">
      <Logo />
      <Stack related flexGrow ai="center" pad="0">
        <Container flexGrow pad surface>
          Search
        </Container>
        <Container pad surface>
          <IconButton icon={Search} />
        </Container>
      </Stack>
    </Stack>
  );
}
