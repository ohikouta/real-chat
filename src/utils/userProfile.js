export function resolveDisplayName(profile, fallback = '匿名ユーザー') {
  if (!profile) {
    return fallback;
  }

  const candidates = [
    profile.displayName,
    profile.username,
    profile.email
  ];

  const resolved = candidates.find((value) => typeof value === 'string' && value.trim());
  return resolved ? resolved.trim() : fallback;
}

export function resolveProfileImageUrl(profile) {
  if (!profile || typeof profile.profileImageUrl !== 'string') {
    return '';
  }

  return profile.profileImageUrl.trim();
}
