import { IRole, IRoom, IUserInRole } from '@rocket.chat/core-typings';
import { Tile, Pagination } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React, { ReactElement } from 'react';

import GenericModal from '../../../../../components/GenericModal';
import { GenericTable, GenericTableHeader, GenericTableHeaderCell, GenericTableBody } from '../../../../../components/GenericTable';
import { usePagination } from '../../../../../components/GenericTable/hooks/usePagination';
import { useSetModal } from '../../../../../contexts/ModalContext';
import { useEndpoint } from '../../../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../../../contexts/TranslationContext';
import UsersInRoleTableRow from './UsersInRoleTableRow';

type UsersInRoleTable = {
	users: IUserInRole[];
	reload: () => void;
	roleName: IRole['name'];
	roleId: IRole['_id'];
	description: IRole['description'];
	total: number;
	rid?: IRoom['_id'];
	paginationData: ReturnType<typeof usePagination>;
};

const UsersInRoleTable = ({ users, reload, roleName, roleId, description, total, rid, paginationData }: UsersInRoleTable): ReactElement => {
	const t = useTranslation();
	const setModal = useSetModal();
	const dispatchToastMessage = useToastMessageDispatch();
	const removeUser = useEndpoint('POST', 'roles.removeUserFromRole');
	const { current, itemsPerPage, setItemsPerPage: onSetItemsPerPage, setCurrent: onSetCurrent, ...paginationProps } = paginationData;

	const closeModal = (): void => setModal();

	const handleRemove = useMutableCallback((username) => {
		const remove = async (): Promise<void> => {
			try {
				await removeUser({ roleId, username, scope: rid });
				dispatchToastMessage({ type: 'success', message: t('User_removed') });
			} catch (error) {
				dispatchToastMessage({ type: 'error', message: error });
			} finally {
				closeModal();
				reload();
			}
		};

		setModal(
			<GenericModal variant='danger' onConfirm={remove} onClose={closeModal} onCancel={closeModal} confirmText={t('Delete')}>
				{t('The_user_s_will_be_removed_from_role_s', username, description || roleName)}
			</GenericModal>,
		);
	});

	return (
		<>
			{users.length === 0 && (
				<Tile fontScale='p2' elevation='0' color='info' textAlign='center'>
					{t('No_data_found')}
				</Tile>
			)}
			{users.length > 0 && (
				<>
					<GenericTable>
						<GenericTableHeader>
							<GenericTableHeaderCell>{t('Name')}</GenericTableHeaderCell>
							<GenericTableHeaderCell>{t('Email')}</GenericTableHeaderCell>
							<GenericTableHeaderCell w='x80'></GenericTableHeaderCell>
						</GenericTableHeader>
						<GenericTableBody>
							{users.map((user) => (
								<UsersInRoleTableRow onRemove={handleRemove} key={user?._id} user={user} />
							))}
						</GenericTableBody>
					</GenericTable>
					<Pagination
						divider
						current={current}
						itemsPerPage={itemsPerPage}
						count={total}
						onSetItemsPerPage={onSetItemsPerPage}
						onSetCurrent={onSetCurrent}
						{...paginationProps}
					/>
				</>
			)}
		</>
	);
};

export default UsersInRoleTable;
