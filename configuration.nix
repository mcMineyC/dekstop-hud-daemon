{ config, pkgs, ... }:

{
  # Enable Xvfb (X virtual framebuffer)
  systemd.services.xvfb = {
    description = "Xvfb virtual framebuffer";
    wantedBy = [ "multi-user.target" ];
    serviceConfig.ExecStart = "${pkgs.xorg.xvfb}/bin/Xvfb :99 -screen 0 1024x768x24";
    serviceConfig.User = "your-username";  # Replace with your username if needed
    environment = {
      DISPLAY = ":99";
    };
    # Start Spotify after Xvfb starts
    serviceConfig.ExecStartPost = "${pkgs.spotify}/bin/spotify &";
  };

  # Enable x11vnc to serve the Xvfb framebuffer over VNC without a password
  systemd.services.x11vnc = {
    description = "x11vnc VNC server without password";
    wantedBy = [ "multi-user.target" ];
    serviceConfig.ExecStart = "${pkgs.x11vnc}/bin/x11vnc -display :99 -forever -shared";
    serviceConfig.User = "your-username";  # Replace with your username if needed
    environment = {
      DISPLAY = ":99";
    };
  };

  # Optional: Create the .vnc directory if not already present
  users.users.your-username = {
    extraUsers = [
      { name = "your-username"; createHome = true; }
    ];
  };
}
