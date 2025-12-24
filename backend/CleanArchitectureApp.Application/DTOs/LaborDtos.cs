namespace CleanArchitectureApp.Application.DTOs;

public record CreateLaborDto(
    string Name,
    string? Phone,
    string LaborType,
    decimal DailyWage,
    string? Address,
    string? AadharNumber
);

public record UpdateLaborDto(
    string? Name,
    string? Phone,
    string? LaborType,
    decimal? DailyWage,
    string? Address,
    string? AadharNumber,
    bool? IsActive
);

public record LaborResponseDto(
    string Id,
    string Name,
    string? Phone,
    string LaborType,
    decimal DailyWage,
    string? Address,
    string? AadharNumber,
    bool IsActive,
    DateTime CreatedAt
);

public record MarkAttendanceDto(
    string LaborId,

    DateTime Date,
    bool IsPresent,
    bool IsHalfDay,
    decimal OvertimeHours
);

public record AttendanceResponseDto(
    string Id,
    DateTime Date,
    string LaborId,
    string LaborName,

    bool IsPresent,
    bool IsHalfDay,
    decimal OvertimeHours,
    decimal WageForDay
);

