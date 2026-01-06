# AI Training and Knowledge Base Guide

You requested information on how to "train" the AI on 100 brands, interviews, and mockup files. In modern LLM development, we typically use **RAG (Retrieval Augmented Generation)** instead of fine-tuning, as it allows you to dynamically update knowledge without costly re-training.

## Strategy: RAG (Retrieval Augmented Generation)

### 1. Preparation
You need to convert your files (PDFs, Interviews, Brand Guidelines) into text chunks and store them in a Vector Database (Supabase supports this!).

**Steps:**
1.  **Extract Text**: Convert all PDFs/Docs to plain text.
2.  **Chunking**: Split text into chunks of ~500-1000 tokens.
3.  **Embedding**: Use an API (like OpenAI `text-embedding-3-small`) to convert text chunks into "vectors" (lists of numbers).
4.  **Storage**: Save these vectors in Supabase.

### 2. Supabase Setup (Vector Store)

Run this in your Supabase SQL Editor to enable vectors:

```sql
-- Enable pgvector extension
create extension if not exists vector;

-- Create a table for your knowledge base
create table documents (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536) -- 1536 is for OpenAI embeddings
);

-- Search function
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  similarity float
)
language sql stable
as $$
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

### 3. Integration in `api/chat/route.ts`

When a user sends a query:
1.  Turn their query into an embedding (using OpenAI API).
2.  Call `rpc('match_documents', ...)` in Supabase to find relevant text chunks.
3.  Inject those chunks into the **System Prompt**.

**Example System Prompt with Context:**
```javascript
const systemPrompt = `
You are an expert AI assistant. Use the following context to answer the user's question.
If the answer isn't in the context, say you don't know.

Context:
${retrievedChunks.join('\n\n')}
`;
```

## "Training" on Mockups
For visual files (mockups), you have two options:
1.  **Vision API**: Pass the image URLs directly to GPT-4o or Claude 3.5 Sonnet in the chat.
2.  **Description**: Use an AI to describe the mockups in text, then store that text in your Vector Database.

This approach gives your AI "memory" of all your documents immediately!
