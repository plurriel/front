const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap');
body {
  font-family: var(--fam, 'DM Sans'), sans-serif;
}

::-webkit-scrollbar {
  width: 1em;
}
::-webkit-scrollbar-thumb {
  background-color: black;
  border-radius: 0.5em;
  border: calc(1em / 3) solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  border: calc(1em / 4) solid transparent;
}
`;

export default styles;
