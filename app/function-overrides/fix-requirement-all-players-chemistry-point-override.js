export const fixAllPlayersChemistryPointsInSbcOverride = () => {
  const isRequirementMet = UTSBCChallengeEntity.prototype.isRequirementMet;
  UTSBCChallengeEntity.prototype.isRequirementMet = function(t) {
    var e, i, r, n = this, o = t.keys().length, s = 0, a = 0, l = null;
    if (!this.squad || this.eligibilityRequirements.indexOf(t) < 0)
        return !1;
    if (t.isCombinedRequirement) {
        a = t.count;
        var c = {};
        this.getApplicableSlotsForCombinedReq(t).forEach(function(t) {
            c[t] ? (c[t] += 1,
                c[t] === o && s++) : c[t] = 1
        }, t)
    } else {
        if (1 !== o)
            return DebugUtils.Assert(!1, "Requirement is empty or invalid."),
        !1;
        var u = t.getFirstKey()
        , p = this.hasMultipleValues(t, u) ? t.getValue(u) : t.getFirstValue(u);
        switch (a = p,
            u) {
            case SBCEligibilityKey.ALL_PLAYERS_CHEMISTRY_POINTS:
            s = this.getNumberOfPlayersWithChemPoints(p, t.scope),
            t.scope = SBCEligibilityScope.GREATER,
            a = UTSquadEntity.FIELD_PLAYERS - this.squad.simpleBrickIndices.length;
            break;
            case SBCEligibilityKey.CHEMISTRY_POINTS:
            s = this.squad.getChemistry();
            break;
            case SBCEligibilityKey.TEAM_STAR_RATING:
            s = this.squad.getStarRating();
            break;
            case SBCEligibilityKey.TEAM_RATING:
            s = this.squad.getRating();
            break;
            case SBCEligibilityKey.PLAYER_QUALITY:
            var h = this.getPlayersPerQualityTier().keys().map(function(t) {
                return parseInt(t, 10)
            });
            if (s = -1,
                0 === h.length)
                break;
            t.scope === SBCEligibilityScope.GREATER ? s = Math.min.apply(Math, h) : t.scope === SBCEligibilityScope.LOWER ? s = Math.max.apply(Math, h) : 1 === h.length && (s = h[0]);
            break;
            case SBCEligibilityKey.PLAYER_LEVEL:
            a = t.count,
            s = this.getNumberOfPlayersByQualityTier(p);
            break;
            case SBCEligibilityKey.SAME_NATION_COUNT:
            l = this.getPlayersPerNation();
            break;
            case SBCEligibilityKey.SAME_LEAGUE_COUNT:
            l = this.getPlayersPerLeague();
            break;
            case SBCEligibilityKey.SAME_CLUB_COUNT:
            l = this.getPlayersPerClub();
            break;
            case SBCEligibilityKey.NATION_COUNT:
            s = this.getPopularNationalities().length;
            break;
            case SBCEligibilityKey.LEAGUE_COUNT:
            s = this.getPopularLeagues().length;
            break;
            case SBCEligibilityKey.CLUB_COUNT:
            s = this.getPopularClubs().length;
            break;
            case SBCEligibilityKey.NATION_ID:
            a = t.count,
            s = this.getNumberOfPlayersByNation(p);
            break;
            case SBCEligibilityKey.LEAGUE_ID:
            a = t.count,
            Array.isArray(p) ? s += p.reduce(function(t, e) {
                return t + n.getNumberOfPlayersByLeague(e)
            }, 0) : s = this.getNumberOfPlayersByLeague(p);
            break;
            case SBCEligibilityKey.CLUB_ID:
            a = t.count,
            s = this.getNumberOfPlayersByClub(p);
            break;
            case SBCEligibilityKey.LEGEND_COUNT:
            s = this.squad.getNumberOfLegends();
            break;
            case SBCEligibilityKey.PLAYER_RARITY:
            a = t.count,
            s = this.getNumberOfPlayersByRarity(p);
            break;
            case SBCEligibilityKey.PLAYER_RARITY_GROUP:
            a = t.count,
            s = this.getNumberOfPlayersByGroup(p);
            break;
            case SBCEligibilityKey.PLAYER_EXACT_OVR:
            case SBCEligibilityKey.PLAYER_MAX_OVR:
            case SBCEligibilityKey.PLAYER_MIN_OVR:
            a = t.count,
            s = this.getNumberOfPlayersByOVR(u, t.getFirstValue(u));
            break;
            case SBCEligibilityKey.FIRST_OWNER_PLAYERS_COUNT:
            s = this.getNumberOfFirstOwnedPlayers(p);
            break;
            case SBCEligibilityKey.PLAYER_TRADABILITY:
            a = t.count,
            s = this.getNumberOfPlayersByTradability(Array.isArray(p) ? 0 === p[0] : 0 === p);
            break;
            default:
            DebugUtils.Assert(!1, "Reached default case: " + u)
        }
    };
    return t.scope === SBCEligibilityScope.GREATER ? (l && (s = Math.max.apply(Math, (e = []).concat.apply(e, l.values()))),
        a <= s) : t.scope === SBCEligibilityScope.LOWER ? (l && (s = Math.max.apply(Math, (i = []).concat.apply(i, l.values()))),
        s <= a) : (l && (s = Math.max.apply(Math, (r = []).concat.apply(r, l.values()))),
        s === a)
    };
};

