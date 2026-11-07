package com.ems.dto.request;

import jakarta.validation.constraints.NotNull;

public class UserStatusRequest {
    @NotNull
    private Boolean enabled;

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
