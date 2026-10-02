import { describe, it, expect } from 'vitest';
import {
  SourceSchema,
  SourceDocumentSchema
} from '../../src/domain/index.js';

describe('Source and SourceDocument domain invariants', () => {
  const validSource = {
    kind: 'SOURCE',
    ref: 'src-1',
    name: 'La Gaceta de Tucumán'
  };

  const validSourceDocument = {
    kind: 'SOURCE_DOCUMENT',
    ref: 'doc-1',
    sourceRef: 'src-1',
    title: 'Entrenamiento de San Martín',
    content: 'San Martín completó una nueva jornada de entrenamiento en La Ciudadela.',
    publishedAt: '2026-10-02T10:00:00Z'
  };

  it('keeps Source and SourceDocument as distinct domain concepts', () => {
    // Both parse individually with valid data
    const parsedSource = SourceSchema.safeParse(validSource);
    expect(parsedSource.success).toBe(true);

    const parsedDoc = SourceDocumentSchema.safeParse(validSourceDocument);
    expect(parsedDoc.success).toBe(true);

    // Kinds are distinct
    if (parsedSource.success && parsedDoc.success) {
      expect(parsedSource.data.kind).toBe('SOURCE');
      expect(parsedDoc.data.kind).toBe('SOURCE_DOCUMENT');
      expect(parsedSource.data.kind).not.toBe(parsedDoc.data.kind);
    }

    // SourceDocument requires sourceRef
    const docWithoutSourceRef = { ...validSourceDocument, sourceRef: undefined };
    expect(SourceDocumentSchema.safeParse(docWithoutSourceRef).success).toBe(false);

    // Cross-parsing fails: Source is not a SourceDocument and vice-versa
    expect(SourceSchema.safeParse(validSourceDocument).success).toBe(false);
    expect(SourceDocumentSchema.safeParse(validSource).success).toBe(false);
  });
});
