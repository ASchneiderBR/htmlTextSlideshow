# Guia de Releases

Este documento explica como criar releases para o projeto OBS HTML Text Slideshow.

## 🚀 Processo de Release

### Opção 1: Via Chat/AI Assistant (Recomendado)

1. **Atualize o CHANGELOG.md** com as mudanças da nova versão:
   ```markdown
   ## [2.1.0] - 2024-12-07
   
   ### Added
   - Nova funcionalidade X
   
   ### Fixed
   - Correção do bug Y
   ```

2. **Peça ao AI para criar o release**:
   - "criar release versão 2.1.0"
   - "create release version 2.1.0"
   - "fazer release 2.1.0"

3. **O AI irá**:
   - Validar o formato da versão
   - Criar o pacote ZIP com os arquivos necessários
   - Extrair as notas de release do CHANGELOG
   - Criar a tag Git
   - Criar o release no GitHub com o ZIP anexado

### Opção 2: Manual via GitHub UI

1. **Atualize o CHANGELOG.md** (mesmo processo acima)

2. **Vá para GitHub Actions**:
   - Acesse: `https://github.com/SEU_USUARIO/htmlTextSlideshow/actions`
   - Clique em "Release" no menu lateral
   - Clique em "Run workflow"
   - Preencha:
     - **Version**: `2.1.0` (formato X.Y.Z)
     - **Release notes**: (opcional, deixe vazio para usar CHANGELOG)
   - Clique em "Run workflow"

3. **Aguarde a conclusão** (geralmente 1-2 minutos)

4. **Verifique o release**:
   - Acesse: `https://github.com/SEU_USUARIO/htmlTextSlideshow/releases`
   - O release estará disponível com o ZIP anexado

## 📦 Conteúdo do Release

O ZIP gerado contém (arquivos soltos na raiz, sem pasta intermediária):
- `Dock.html` - Painel de controle
- `Source.html` - Overlay para OBS
- `text-slides.lua` - Script Lua para OBS
- `README.md` - Documentação
- `LICENSE` - Licença GPL v2.0+

## 🏷️ Versionamento

Seguimos [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Mudanças incompatíveis com versões anteriores
- **MINOR** (0.X.0): Novas funcionalidades compatíveis com versões anteriores
- **PATCH** (0.0.X): Correções de bugs compatíveis

### Exemplos:
- `2.0.0` → `2.1.0`: Nova funcionalidade (minor)
- `2.1.0` → `2.1.1`: Correção de bug (patch)
- `2.1.1` → `3.0.0`: Mudança quebra compatibilidade (major)

## 📝 Formato do CHANGELOG

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Nova funcionalidade ou recurso

### Changed
- Mudança em funcionalidade existente

### Fixed
- Correção de bug

### Removed
- Funcionalidade removida

### Deprecated
- Funcionalidade que será removida no futuro
```

## ⚠️ Importante

- **Sempre atualize o CHANGELOG.md antes de criar um release**
- O workflow valida se a tag já existe (evita duplicatas)
- O workflow extrai automaticamente as notas do CHANGELOG se você não fornecer manualmente
- A versão no código (`Dock.html` linha ~1260) é para controle interno, não precisa ser atualizada para cada release

## 🔍 Verificação Pós-Release

Após criar o release, verifique:

1. ✅ Tag criada corretamente no Git
2. ✅ Release publicado no GitHub
3. ✅ ZIP anexado e baixável
4. ✅ Notas de release corretas
5. ✅ Arquivos no ZIP estão corretos

## 🐛 Troubleshooting

**Erro: "Tag already exists"**
- A versão já foi lançada. Use uma versão diferente ou delete a tag existente.

**Erro: "Version format invalid"**
- Use o formato X.Y.Z (ex: 2.1.0, não 2.1 ou v2.1.0)

**ZIP não foi anexado**
- Verifique os logs do workflow para erros
- Certifique-se de que os arquivos existem no repositório

**Notas de release vazias**
- Verifique se o CHANGELOG.md tem uma entrada para a versão
- Ou forneça as notas manualmente no campo "Release notes"


