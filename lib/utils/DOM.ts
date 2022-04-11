export function insertAfter(newNode: Node, referenceNode: Node): void {
    const referenceParent = referenceNode.parentElement;
    if (!referenceParent) {
        return;
    }
    const refrenceSibling = referenceNode.nextSibling;
    referenceParent.insertBefore(newNode, refrenceSibling);
};

export function insertBefore(newNode: Node, referenceNode: Node): void {
    const referenceParent = referenceNode.parentElement;
    if (!referenceParent) {
        return;
    }
    referenceParent.insertBefore(newNode, referenceNode);
};