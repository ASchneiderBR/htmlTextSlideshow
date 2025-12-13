obs = obslua

local hotkeys = {
  next = nil,
  prev = nil,
  first = nil
}

local command_seq = 0

-- Use OBS built-in function to get the script's directory
local script_dir = script_path()

local function hotkey_path()
  return script_dir .. "hotkeys.js"
end

local function write_command(command)
  command_seq = command_seq + 1
  local path = hotkey_path()
  local file, err = io.open(path, "w")
  if not file then
    obs.script_log(obs.LOG_WARNING, "Could not update hotkeys.js at '" .. path .. "': " .. tostring(err))
    return
  end
  local payload = string.format(
    "window.__textSlidesHotkey={seq:%d,command:%s,updatedAt:'%s'};",
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

local function first_pressed(pressed)
  if not pressed then return end
  write_command("'first'")
end

local function script_description()
  return [[OBS Text Slideshow v2.0

Control on-stream text slides with a custom browser dock, markdown formatting (bold, italic, headings, lists, code), advanced typography (fonts, colors, shadow 0-100, stroke 0-10), and 13 transition types. Use global hotkeys (Next/Prev/First) to control slides during your stream.

INSTALLATION: See "Properties" tab for file paths and setup.
HOTKEYS: Settings > Hotkeys > search "Text Slides" (NOT in this window!)]]
end

function script_properties()
  local props = obs.obs_properties_create()
  
  local dock_path = "file:///" .. script_dir .. "Dock.html"
  local source_path = script_dir .. "Source.html"
  
  obs.obs_properties_add_text(props, "about", "OBS Text Slideshow v2.2.0 - Control on-stream text slides with markdown formatting, advanced typography, and transitions.", obs.OBS_TEXT_INFO)
  
  obs.obs_properties_add_text(props, "instr_1", "STEP 1: Add Custom Dock (View > Docks > Custom Browser Docks)", obs.OBS_TEXT_INFO)
  local p_dock = obs.obs_properties_add_text(props, "dock_url", "Dock URL (copy this)", obs.OBS_TEXT_DEFAULT)
  obs.obs_property_set_enabled(p_dock, true)
  
  obs.obs_properties_add_text(props, "instr_2", "STEP 2: Add Browser Source (check 'Local file', browse to this path)", obs.OBS_TEXT_INFO)
  local p_source = obs.obs_properties_add_text(props, "source_path", "Source Path (copy or browse)", obs.OBS_TEXT_DEFAULT)
  obs.obs_property_set_enabled(p_source, true)
  
  obs.obs_properties_add_text(props, "instr_3", "STEP 3: Configure Hotkeys in Settings > Hotkeys (search 'Text Slides')", obs.OBS_TEXT_INFO)
  
  obs.obs_properties_add_text(props, "credits_name", "Created by Antonio Schneider", obs.OBS_TEXT_INFO)
  local github_url = obs.obs_properties_add_text(props, "github_url", "GitHub", obs.OBS_TEXT_DEFAULT)
  obs.obs_property_set_enabled(github_url, true)
  
  return props
end

function script_update(settings)
  -- Keep the fields populated with the correct paths when settings change/load
  local dock_path = "file:///" .. script_dir .. "Dock.html"
  local source_path = "file:///" .. script_dir .. "Source.html"
  
  obs.obs_data_set_string(settings, "dock_url", dock_path)
  obs.obs_data_set_string(settings, "source_path", source_path)
  obs.obs_data_set_string(settings, "github_url", "https://github.com/ASchneiderBR/htmlTextSlideshow")
end

function script_load(settings_data)
  hotkeys.next = obs.obs_hotkey_register_frontend("text_slides_next", "Text Slides: Next", next_pressed)
  hotkeys.prev = obs.obs_hotkey_register_frontend("text_slides_prev", "Text Slides: Previous", prev_pressed)
  hotkeys.first = obs.obs_hotkey_register_frontend("text_slides_first", "Text Slides: First", first_pressed)
  
  local next_saved = obs.obs_data_get_array(settings_data, "text_slides_next")
  local prev_saved = obs.obs_data_get_array(settings_data, "text_slides_prev")
  local first_saved = obs.obs_data_get_array(settings_data, "text_slides_first")
  
  obs.obs_hotkey_load(hotkeys.next, next_saved)
  obs.obs_hotkey_load(hotkeys.prev, prev_saved)
  obs.obs_hotkey_load(hotkeys.first, first_saved)
  
  obs.obs_data_array_release(next_saved)
  obs.obs_data_array_release(prev_saved)
  obs.obs_data_array_release(first_saved)
  
  -- Try to initialize hotkeys file
  write_command("null")
  
  local dock_url = "file:///" .. script_dir:gsub("\\", "/") .. "Dock.html"
  local source_path = script_dir:gsub("\\", "/") .. "Source.html"
  
  print("[Text Slides v2.0] Loaded by Antonio Schneider")
  print("[Text Slides] Dock URL: " .. dock_url)
  print("[Text Slides] Source Path: " .. source_path)
  print("[Text Slides] Check script Properties for installation steps")
end

function script_save(settings_data)
  local next_array = obs.obs_hotkey_save(hotkeys.next)
  local prev_array = obs.obs_hotkey_save(hotkeys.prev)
  local first_array = obs.obs_hotkey_save(hotkeys.first)
  
  obs.obs_data_set_array(settings_data, "text_slides_next", next_array)
  obs.obs_data_set_array(settings_data, "text_slides_prev", prev_array)
  obs.obs_data_set_array(settings_data, "text_slides_first", first_array)
  
  obs.obs_data_array_release(next_array)
  obs.obs_data_array_release(prev_array)
  obs.obs_data_array_release(first_array)
end

function script_unload()
  obs.obs_hotkey_unregister(next_pressed)
  obs.obs_hotkey_unregister(prev_pressed)
  obs.obs_hotkey_unregister(first_pressed)
end

