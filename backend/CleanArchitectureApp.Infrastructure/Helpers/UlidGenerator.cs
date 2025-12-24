namespace CleanArchitectureApp.Infrastructure.Helpers;

/// <summary>
/// Helper class for generating ULIDs (Universally Unique Lexicographically Sortable Identifiers)
/// </summary>
public static class UlidGenerator
{
    /// <summary>
    /// Generates a new ULID as a string
    /// </summary>
    /// <returns>A new ULID string</returns>
    public static string Generate()
    {
        return Ulid.NewUlid().ToString();
    }
    
    /// <summary>
    /// Generates a new ULID and returns it as a Ulid struct
    /// </summary>
    /// <returns>A new ULID</returns>
    public static Ulid GenerateUlid()
    {
        return Ulid.NewUlid();
    }
    
    /// <summary>
    /// Tries to parse a string as a ULID
    /// </summary>
    /// <param name="value">The string to parse</param>
    /// <param name="result">The parsed ULID if successful</param>
    /// <returns>True if parsing was successful, false otherwise</returns>
    public static bool TryParse(string value, out Ulid result)
    {
        return Ulid.TryParse(value, out result);
    }
}
