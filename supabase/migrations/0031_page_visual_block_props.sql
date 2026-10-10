-- Controlled visual presentation props for editable site blocks.
-- Extend, never remove, existing strict text and URL checks.
create or replace function public.veyra_valid_page_blocks(document jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare block jsonb; props jsonb; prop_key text; block_id text; ids text[] := array[]::text[];
begin
  if jsonb_typeof(document) is distinct from 'array' then return false; end if;
  if jsonb_array_length(document) > 80 then return false; end if;
  for block in select value from jsonb_array_elements(document) loop
    if jsonb_typeof(block) is distinct from 'object'
      or coalesce(block->>'type','') not in ('heading','paragraph','button','divider','image','quote','faq','spacer')
      or coalesce(block->>'id','') !~ '^[a-zA-Z0-9_-]{1,80}$'
      or block->>'id' = any(ids)
      or jsonb_typeof(block->'props') is distinct from 'object'
      or jsonb_typeof(block->'children') is distinct from 'array'
      or jsonb_array_length(block->'children') <> 0
      or exists (select 1 from jsonb_object_keys(block) as k where k not in ('id','type','props','children'))
    then return false; end if;
    ids := array_append(ids,block->>'id');
    props := block->'props';
    if (select count(*) from jsonb_object_keys(props)) > 8 then return false; end if;
    for prop_key in select jsonb_object_keys(props) loop
      if prop_key not in ('text','url','alt','question','answer','align','width','tone')
        or jsonb_typeof(props->prop_key) is distinct from 'string'
        or length(props->>prop_key) > 4000 then return false; end if;
    end loop;
    if (props ? 'align' and props->>'align' not in ('left','center','right'))
     or (props ? 'width' and props->>'width' not in ('full','medium','narrow'))
     or (props ? 'tone' and props->>'tone' not in ('plain','soft','accent')) then return false; end if;
    if block->>'type' in ('button','image') then
      if coalesce(props->>'url','') !~ '^(https://[^[:space:]]+|/[^/[:space:]][^[:space:]]*)$'
        and props->>'url' <> '/' then return false; end if;
    end if;
    if block->>'type'='image' and coalesce(length(props->>'alt'),0)>220 then return false; end if;
  end loop;
  return true;
exception when others then return false;
end; $$;
