-- 0003b_transitions.sql — ADR 0004 state machine (authoritative)

create or replace function public.enforce_content_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_status public.content_status;
  new_status public.content_status;
  is_service boolean;
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  old_status := old.status;
  new_status := new.status;

  if old_status = new_status then
    return new;
  end if;

  -- Service role (scheduler callback) is the only identity that may set Posted
  is_service := (auth.role() = 'service_role');

  if new_status = 'Posted' and not is_service then
    raise exception 'Posted may only be set by the service role'
      using errcode = 'P0001';
  end if;

  -- Terminal states are frozen except service role recoveries
  if old_status in ('Posted', 'Published', 'Killed') and not is_service then
    raise exception 'Cannot transition from terminal status %', old_status
      using errcode = 'P0001';
  end if;

  -- Kill is reachable from any pre-terminal status
  if new_status = 'Killed' then
    if old_status in ('Posted', 'Published', 'Killed') then
      raise exception 'Cannot kill from %', old_status using errcode = 'P0001';
    end if;
    return new;
  end if;

  -- Blog may never reach Scheduled or Posted
  if new.type = 'blog' and new_status in ('Scheduled', 'Posted') then
    raise exception 'Blog items cannot reach %', new_status
      using errcode = 'P0001';
  end if;

  -- Social may never reach Published
  if new.type = 'social' and new_status = 'Published' then
    raise exception 'Social items cannot reach Published'
      using errcode = 'P0001';
  end if;

  -- Allowed forward transitions
  if old_status = 'Planned' and new_status = 'Editing' then
    return new;
  elsif old_status = 'Editing' and new_status in ('Reviewing', 'Planned') then
    return new;
  elsif old_status = 'Reviewing' and new_status in ('Ready', 'Editing') then
    return new;
  elsif old_status = 'Ready' and new_status in ('Scheduled', 'Published', 'Editing', 'Reviewing') then
    -- Scheduled only for social; Published only for blog (checked above)
    if new_status = 'Scheduled' and new.type <> 'social' then
      raise exception 'Scheduled requires social type' using errcode = 'P0001';
    end if;
    if new_status = 'Published' and new.type <> 'blog' then
      raise exception 'Published requires blog type' using errcode = 'P0001';
    end if;
    return new;
  elsif old_status = 'Scheduled' and new_status in ('Posted', 'Ready') then
    -- Posted: service only (checked). Ready: failure rollback.
    return new;
  end if;

  raise exception 'Invalid transition % → % for type %',
    old_status, new_status, new.type
    using errcode = 'P0001';
end;
$$;

create trigger content_items_status_machine
  before update of status on public.content_items
  for each row execute function public.enforce_content_status_transition();
