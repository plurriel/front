/* eslint-disable no-fallthrough */
import { prisma } from './prisma';
import { SomeTrueTree } from './sometruetree';

function hasPermissionsLocal(
  localPerms: Record<string, any>,
  oldRequestedPerms: Set<string>,
): boolean | Set<string> {
  const requestedPerms = new Set(oldRequestedPerms);
  // eslint-disable-next-line no-restricted-syntax
  for (const requestedPerm of requestedPerms) {
    const localAuthorizationValue = localPerms[requestedPerm];
    if (localAuthorizationValue === false) return false;
    if (localAuthorizationValue === true) requestedPerms.delete(requestedPerm);
  }
  // OMG MY EYES ARE BLEEDING OUT PLEASE CHANGE THIS
  if (requestedPerms.size === 0 && !localPerms.inexistant) return true;
  return requestedPerms;
}

type ScopeTypes = 'domain' | 'subdomain' | 'address';

// eslint-disable-next-line import/prefer-default-export
export async function hasPermissions(
  [scopeType, originalScopeId]: [ScopeTypes, string],
  requestedPerms: string[],
  userId: string,
) {
  const now = Date.now();
  let requestedPermsSet = new Set(requestedPerms);
  let scopeId = originalScopeId;
  switch (scopeType) {
    case 'address':
      const addressQuery = await prisma.address.findUnique({
        where: {
          id: scopeId,
        },
        include: {
          usersLink: {
            where: {
              userId,
            },
          },
        },
      });
      if (!addressQuery) throw new Error(`No such entity: ${scopeType}:${scopeId}`);
      const {
        usersLink: [addressAuthorization],
        ...address
      } = addressQuery;
      console.log('authorization', -2, Date.now() - now);
      if (addressAuthorization) {
        const currScopePermCheck = hasPermissionsLocal(addressAuthorization, requestedPermsSet);
        if (!(currScopePermCheck instanceof Set)) return currScopePermCheck;
        requestedPermsSet = currScopePermCheck;
      }
      if (!address) return false;
      scopeId = address.subdomainId;
      scopeType = 'subdomain';
    case 'subdomain':
      const subdomainQuery = await prisma.subdomain.findUnique({
        where: {
          id: scopeId,
        },
        include: {
          usersLink: {
            where: {
              userId,
            },
          },
        },
      });
      if (!subdomainQuery) throw new Error(`No such entity: ${scopeType}:${scopeId}`);
      const {
        usersLink: [subdomainAuthorization],
        ...subdomain
      } = subdomainQuery;
      console.log('authorization', -1, Date.now() - now);
      if (subdomainAuthorization) {
        const currScopePermCheck = hasPermissionsLocal(subdomainAuthorization, requestedPermsSet);
        if (!(currScopePermCheck instanceof Set)) return currScopePermCheck;
        requestedPermsSet = currScopePermCheck;
      }
      if (!subdomain) return false;
      scopeId = subdomain.domainId;
      scopeType = 'domain';
    case 'domain':
      const domainQuery = await prisma.domain.findUnique({
        where: {
          id: scopeId,
        },
        include: {
          usersLink: {
            where: {
              userId,
            },
          },
        },
      });
      if (!domainQuery) throw new Error(`No such entity: ${scopeType}:${scopeId}`);
      const {
        usersLink: [domainAuthorization],
        ...domain
      } = domainQuery;
      console.log('authorization', 0, Date.now() - now);
      if (domainAuthorization) {
        const currScopePermCheck = hasPermissionsLocal(domainAuthorization, requestedPermsSet);
        if (!(currScopePermCheck instanceof Set)) return currScopePermCheck;
        requestedPermsSet = currScopePermCheck;
      }
    default:
      return false;
  }
}

// eslint-disable-next-line import/prefer-default-export
export async function hasPermissionsWithin(
  [scopeType, originalScopeId]: [ScopeTypes, string],
  requestedPerms: string[],
  userId: string,
) {
  const requestedPermsSet = new Set(requestedPerms);
  const scopeId = originalScopeId;
  let nextQuery;
  let mapHigherUp = false;

  interface HasNext {
    [k: string]: any;
    next?: [ScopeTypes, string][];
  }

  const domains: Record<string, HasNext> = {};
  const subdomains: Record<string, HasNext> = {};
  const addresses: Record<string, HasNext> = {};
  switch (scopeType) {
    case 'domain':
      const domainQuery = await prisma.domain.findUnique({
        where: {
          id: scopeId,
        },
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
        },
      });

      if (!domainQuery) throw new Error(`No such entity: ${scopeType}:${scopeId}`);
      const {
        id,
        usersLink: [domainAuthorization],
      } = domainQuery;
      domains[id] = domainAuthorization || { inexistant: true };
      nextQuery = {
        domainId: scopeId,
      };
      mapHigherUp = true;
    case 'subdomain':
      if (!nextQuery) {
        nextQuery = {
          id: scopeId,
        };
      }
      const subdomainAuthorizations = await prisma.subdomain.findMany({
        where: nextQuery,
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
          domainId: mapHigherUp,
        },
      });
      subdomainAuthorizations.forEach((subdomainAuthorizationObj) => {
        const subdomainAuthorization = subdomainAuthorizationObj.usersLink[0];
        subdomains[subdomainAuthorizationObj.id] = subdomainAuthorization || { inexistant: true };
        const { domainId } = subdomainAuthorizationObj;
        if (domainId && domainId in domains) {
          domains[domainId].next ??= [];
          domains[domainId].next?.push(['subdomain', subdomainAuthorizationObj.id]);
        }
      });
      nextQuery = {
        subdomain: nextQuery,
      };
    case 'address':
      if (!nextQuery) {
        nextQuery = {
          id: scopeId,
        };
      }
      const addressAuthorizations = await prisma.address.findMany({
        where: nextQuery,
        select: {
          id: true,
          usersLink: {
            where: {
              userId,
            },
          },
          subdomainId: mapHigherUp,
        },
      });
      addressAuthorizations.forEach((addressAuthorizationObj) => {
        const addressAuthorization = addressAuthorizationObj.usersLink[0];
        addresses[addressAuthorizationObj.id] = addressAuthorization || { inexistant: true };
        const { subdomainId } = addressAuthorizationObj;
        if (subdomainId && subdomainId in subdomains) {
          subdomains[subdomainId].next ??= [];
          subdomains[subdomainId].next?.push(['address', addressAuthorizationObj.id]);
        }
      });
      break;
    default:
      throw new Error(`Unknown scope type: ${scopeType}`);
  }
  const result = new SomeTrueTree<[ScopeTypes, string]>([scopeType, scopeId]);
  // const nextScope = {
  //   domain: 'subdomain',
  //   subdomain: 'address',
  // };
  function recursiveTreeTraversal(
    currentNode: SomeTrueTree<[ScopeTypes, string]>,
    [traversalScopeType, traversalScopeId]: [ScopeTypes, string],
    permissionsLocalLatest: boolean = false,
  ): boolean {
    const scopes = {
      address: addresses,
      subdomain: subdomains,
      domain: domains,
    };

    const { next, ...currentObject } = scopes[traversalScopeType][traversalScopeId];

    const hasPermissionsResult = hasPermissionsLocal(currentObject, requestedPermsSet);
    currentNode.value = hasPermissionsResult instanceof Set
      ? permissionsLocalLatest
      : hasPermissionsResult;

    const override = next?.map(([type, id]) => {
      const label: [ScopeTypes, string] = [type, id];
      const newCurrentNode = currentNode.set(
        id,
        new SomeTrueTree<[ScopeTypes, string]>(label),
      );
      const traversal = recursiveTreeTraversal(
        newCurrentNode,
        label,
        hasPermissionsResult instanceof Set
          ? permissionsLocalLatest
          : hasPermissionsResult,
      );
      // console.log(
      //   `TRAVERSING NODE ${id}`,
      //   hasPermissionsResult,
      //   newCurrentNode,
      //   label,
      //   scopes[type][id],
      //   hasPermissionsResult instanceof Set
      //     ? permissionsLocalLatest
      //     : hasPermissionsResult,
      //   traversal,
      // );
      return traversal;
    }).some(Boolean) || permissionsLocalLatest;

    return hasPermissionsResult instanceof Set
      ? override
      : hasPermissionsResult;
  }
  recursiveTreeTraversal(result, [scopeType, scopeId]);
  return result;
}
