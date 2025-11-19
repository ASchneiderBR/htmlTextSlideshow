obs = obslua

local hotkeys = {
  next = nil,
  prev = nil
}

local command_seq = 0

local function script_description()
  return [[
Simple hotkey relay that sends “next” and “previous” commands to the control panel / browser source.

Hotkeys:
- Next slide
- Previous slide

The dock polls data/hotkeys.js (overwritten by this script) just like Animated Lower Thirds.
]]
end

local function hotkey_path()
  return script_path() .. "../data/hotkeys.js"
end

local function write_command(command)
  command_seq = command_seq + 1
  local file, err = io.open(hotkey_path(), "w")
  if not file then
    obs.script_log(obs.LOG_WARNING, "Could not update hotkeys.js: " .. tostring(err))
    return
  end
  local payload = string.format(
    "window.__obsTextSlidesHotkey={seq:%d,command:%s,updatedAt:'%s'};",
    command_seq,
    command,
    os.date("!%Y-%m-%dT%H:%M:%S.000Z")
  )
  file:write(payload)
  file:close()
end

local function next_pressed(pressed)
  if not pressed then return end
  write_command("'next'")
end

local function prev_pressed(pressed)
  if not pressed then return end
  write_command("'prev'")
end

function script_properties()
  local props = obs.obs_properties_create()
  return props
end

function script_update(updated_settings)
end

function script_defaults(defaults)
end

function script_load(settings_data)
  hotkeys.next = obs.obs_hotkey_register_frontend("text_slides_next", "Text Slides: Next", next_pressed)
  hotkeys.prev = obs.obs_hotkey_register_frontend("text_slides_prev", "Text Slides: Previous", prev_pressed)
  local next_saved = obs.obs_data_get_array(settings_data, "text_slides_next")
  local prev_saved = obs.obs_data_get_array(settings_data, "text_slides_prev")
  obs.obs_hotkey_load(hotkeys.next, next_saved)
  obs.obs_hotkey_load(hotkeys.prev, prev_saved)
  obs.obs_data_array_release(next_saved)
  obs.obs_data_array_release(prev_saved)
  write_command("null")
end

function script_save(settings_data)
  local next_array = obs.obs_hotkey_save(hotkeys.next)
  local prev_array = obs.obs_hotkey_save(hotkeys.prev)
  obs.obs_data_set_array(settings_data, "text_slides_next", next_array)
  obs.obs_data_set_array(settings_data, "text_slides_prev", prev_array)
  obs.obs_data_array_release(next_array)
  obs.obs_data_array_release(prev_array)
end

function script_unload()
  obs.obs_hotkey_unregister(next_pressed)
  obs.obs_hotkey_unregister(prev_pressed)
end
