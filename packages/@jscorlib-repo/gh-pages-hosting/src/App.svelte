<script lang="ts">
  import {
      ClickableTile,
      Column,
      Content,
      Grid,
      Header,
      HeaderGlobalAction,
      HeaderUtilities,
      Row,
      SkipToContent,
      TileGroup
  } from "carbon-components-svelte";
  import "carbon-components-svelte/css/white.css";
  import LogoGithub from "carbon-icons-svelte/lib/LogoGithub.svelte";
  import LogoNpm from "carbon-icons-svelte/lib/LogoNpm.svelte";
</script>

<main>
  <Header company="CXuesong" platformName="jscorlib">
    <svelte:fragment slot="skip-to-content">
      <SkipToContent />
    </svelte:fragment>
    <HeaderUtilities>
      <HeaderGlobalAction icon={LogoGithub} iconDescription="GitHub [CXuesong/jscorlib]" href="https://github.com/CXuesong/jscorlib" />
      <HeaderGlobalAction icon={LogoNpm} iconDescription="npm [jscorlib]" href="https://www.npmjs.com/package/jscorlib" />
    </HeaderUtilities>
  </Header>

  <Content>
    <Grid>
      <Row padding>
        <Column>
          <h1>jscorlib</h1>
          <h4>landing page</h4>
        </Column>
      </Row>
      <Row padding>
        <Column>
          <TileGroup>
            <ClickableTile href="docs/latest/">Library documentation</ClickableTile>
          </TileGroup>
        </Column>
      </Row>
      <Row padding>
        <Column>
          <TileGroup>
            <ClickableTile href="https://github.com/CXuesong/jscorlib">GitHub [CXuesong/jscorlib]</ClickableTile>
            <ClickableTile href="https://www.npmjs.com/package/jscorlib">npm [jscorlib]</ClickableTile>
          </TileGroup>
        </Column>
      </Row>
      <Row padding>
        <Column>
          <TileGroup>
            <ClickableTile href="coverage/latest/jscorlib">Test coverage [jscorlib]</ClickableTile>
            <ClickableTile href="coverage/latest/@jscorlib/polyfills">Test coverage [@jscorlib/polyfills]</ClickableTile>
          </TileGroup>
        </Column>
      </Row>
    </Grid>
  </Content>
</main>

<style lang="scss">
</style>
